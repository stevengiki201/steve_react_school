"""
MarketHub Backend — API Views
"""
from django.db import transaction
from django.db.models import Q
from django.utils.text import slugify
from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import (
    SellerProfile, Category, Product, ProductImage,
    Cart, CartItem, Order, OrderItem, Payment,
    AdvertisementCampaign, AdvertisementEvent,
)
from .serializers import (
    UserRegistrationSerializer, UserSerializer, UserUpdateSerializer,
    SellerProfileSerializer, SellerProfileCreateSerializer,
    CategorySerializer,
    ProductListSerializer, ProductDetailSerializer, ProductCreateSerializer, ProductImageSerializer,
    CartSerializer, CartItemSerializer,
    OrderListSerializer, OrderDetailSerializer, OrderCreateSerializer, OrderItemSerializer,
    CampaignSerializer, CampaignDetailSerializer,
)

User = get_user_model()


# ==========================================
# AUTH VIEWS
# ==========================================
class RegisterView(generics.CreateAPIView):
    """Register a new user."""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "access": str(tokens.access_token),
            "refresh": str(tokens),
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current user profile."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# ==========================================
# SELLER VIEWS
# ==========================================
class SellerProfileViewSet(viewsets.ModelViewSet):
    """CRUD for seller profiles."""
    queryset = SellerProfile.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == "create":
            return SellerProfileCreateSerializer
        return SellerProfileSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user's seller profile."""
        try:
            profile = SellerProfile.objects.get(user=request.user)
            return Response(SellerProfileSerializer(profile).data)
        except SellerProfile.DoesNotExist:
            return Response({"detail": "No seller profile"}, status=404)


# ==========================================
# CATEGORY VIEWS
# ==========================================
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve categories."""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None


# ==========================================
# PRODUCT VIEWS
# ==========================================
class ProductViewSet(viewsets.ModelViewSet):
    """Product CRUD with search and filtering."""
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Product.objects.all()
        # Filter by active
        if self.action == "list":
            qs = qs.filter(is_active=True)
        # Search
        q = self.request.query_params.get("q", "")
        if q:
            qs = qs.filter(
                Q(name__icontains=q) | Q(description__icontains=q)
            )
        # Filter by category
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category_id=category)
        # Filter by seller
        seller = self.request.query_params.get("seller")
        if seller:
            qs = qs.filter(seller_id=seller)
        # Featured
        featured = self.request.query_params.get("featured")
        if featured:
            qs = qs.filter(is_featured=True)
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return ProductCreateSerializer
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def featured(self, request):
        """Get featured products."""
        products = Product.objects.filter(is_active=True, is_featured=True)[:8]
        return Response(ProductListSerializer(products, many=True).data)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def search(self, request):
        """Search products."""
        q = request.query_params.get("q", "")
        category = request.query_params.get("category")
        qs = Product.objects.filter(is_active=True)
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q))
        if category:
            qs = qs.filter(category_id=category)
        return Response(ProductListSerializer(qs[:40], many=True).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def deactivate(self, request, pk=None):
        """Deactivate a product (soft delete)."""
        product = self.get_object()
        if product.seller.user != request.user:
            return Response({"detail": "Not authorized"}, status=403)
        product.is_active = False
        product.save()
        return Response({"detail": "Product deactivated"})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def upload_image(self, request, pk=None):
        """Upload an image for a product."""
        product = self.get_object()
        if product.seller.user != request.user:
            return Response({"detail": "Not authorized"}, status=403)

        image_file = request.FILES.get("image")
        if not image_file:
            return Response({"detail": "No image provided"}, status=400)

        is_primary = product.images.count() == 0
        product_image = ProductImage.objects.create(
            product=product,
            image=image_file,
            alt=request.data.get("alt", product.name),
            sort_order=product.images.count(),
            is_primary=is_primary,
        )
        return Response(ProductImageSerializer(product_image).data, status=201)


# ==========================================
# CART VIEWS
# ==========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_cart(request):
    """Get current user's cart."""
    cart, _ = Cart.objects.get_or_create(user=request.user)
    return Response(CartSerializer(cart).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """Add item to cart."""
    product_id = request.data.get("product_id")
    quantity = int(request.data.get("quantity", 1))

    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({"detail": "Product not found"}, status=404)

    if product.stock_quantity < quantity:
        return Response({"detail": "Not enough stock"}, status=400)

    cart, _ = Cart.objects.get_or_create(user=request.user)
    item, created = CartItem.objects.get_or_create(
        cart=cart, product=product, defaults={"quantity": quantity}
    )
    if not created:
        item.quantity += quantity
        if item.quantity > product.stock_quantity:
            return Response({"detail": "Not enough stock"}, status=400)
        item.save()

    return Response(CartSerializer(cart).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    """Update cart item quantity."""
    try:
        item = CartItem.objects.get(id=item_id, cart__user=request.user)
    except CartItem.DoesNotExist:
        return Response({"detail": "Item not found"}, status=404)

    quantity = int(request.data.get("quantity", 1))
    if quantity <= 0:
        item.delete()
    else:
        if quantity > item.product.stock_quantity:
            return Response({"detail": "Not enough stock"}, status=400)
        item.quantity = quantity
        item.save()

    cart = Cart.objects.get(user=request.user)
    return Response(CartSerializer(cart).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    """Remove item from cart."""
    try:
        item = CartItem.objects.get(id=item_id, cart__user=request.user)
    except CartItem.DoesNotExist:
        return Response({"detail": "Item not found"}, status=404)

    item.delete()
    cart = Cart.objects.get(user=request.user)
    return Response(CartSerializer(cart).data)


# ==========================================
# ORDER VIEWS
# ==========================================
class OrderViewSet(viewsets.ModelViewSet):
    """Order CRUD with state machine."""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Order.objects.all()
        if user.role == "seller":
            seller_profile = SellerProfile.objects.get(user=user)
            order_ids = OrderItem.objects.filter(
                seller=seller_profile
            ).values_list("order_id", flat=True).distinct()
            return Order.objects.filter(id__in=order_ids)
        return Order.objects.filter(customer=user)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return OrderDetailSerializer
        return OrderListSerializer

    @action(detail=False, methods=["post"])
    def create_order(self, request):
        """Create order from cart (checkout)."""
        user = request.user
        cart = Cart.objects.filter(user=user).first()
        if not cart or cart.items.count() == 0:
            return Response({"detail": "Cart is empty"}, status=400)

        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            subtotal = 0
            order_items_data = []

            for cart_item in cart.items.select_related("product", "product__seller").all():
                product = cart_item.product
                if not product.is_active or product.stock_quantity < cart_item.quantity:
                    return Response(
                        {"detail": f"Product {product.name} not available"},
                        status=400,
                    )

                item_total = product.price * cart_item.quantity
                subtotal += item_total

                # Get first image URL
                first_image = product.images.first()
                image_url = first_image.image.url if first_image else ""

                order_items_data.append({
                    "product": product,
                    "seller": product.seller,
                    "product_name": product.name,
                    "product_image": image_url,
                    "quantity": cart_item.quantity,
                    "unit_price": product.price,
                    "total_price": item_total,
                    "currency": product.currency,
                })

                # Decrement stock
                product.stock_quantity -= cart_item.quantity
                product.save()

            delivery_fee = 2000
            total = subtotal + delivery_fee

            order = Order.objects.create(
                customer=user,
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                total=total,
                currency="TZS",
                customer_name=data["customer_name"],
                customer_phone=data["customer_phone"],
                delivery_address=data["delivery_address"],
                delivery_location=data.get("delivery_location", ""),
                payment_method=data["payment_method"],
                notes=data.get("notes", ""),
            )

            for item_data in order_items_data:
                OrderItem.objects.create(order=order, **item_data)

            # Create payment record
            Payment.objects.create(
                order=order,
                amount=total,
                currency="TZS",
                method=data["payment_method"],
                status="pending",
            )

            # Clear cart
            cart.items.all().delete()

        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        """Update order status with state machine validation."""
        order = self.get_object()
        new_status = request.data.get("status")

        ALLOWED_TRANSITIONS = {
            "pending_payment": ["paid", "cancelled"],
            "paid": ["confirmed", "cancelled", "refunded"],
            "confirmed": ["processing", "cancelled"],
            "processing": ["ready_for_delivery", "shipped", "cancelled"],
            "ready_for_delivery": ["shipped", "delivered"],
            "shipped": ["delivered"],
            "delivered": ["refunded"],
            "cancelled": [],
            "refunded": [],
        }

        allowed = ALLOWED_TRANSITIONS.get(order.status, [])
        if new_status not in allowed:
            return Response(
                {"detail": f"Invalid transition: {order.status} → {new_status}"},
                status=400,
            )

        order.status = new_status
        order.save()

        # Update seller stats on delivery
        if new_status == "delivered":
            for item in order.items.all():
                item.seller.total_orders += 1
                item.seller.total_sales += item.total_price
                item.seller.save()

        return Response(OrderDetailSerializer(order).data)


# ==========================================
# ADVERTISEMENT VIEWS
# ==========================================
class CampaignViewSet(viewsets.ModelViewSet):
    """Campaign CRUD and analytics."""
    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return AdvertisementCampaign.objects.all()
        try:
            seller = SellerProfile.objects.get(user=user)
            return AdvertisementCampaign.objects.filter(seller=seller)
        except SellerProfile.DoesNotExist:
            return AdvertisementCampaign.objects.none()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CampaignDetailSerializer
        return CampaignSerializer

    def perform_create(self, serializer):
        seller = SellerProfile.objects.get(user=self.request.user)
        serializer.save(seller=seller)

    @action(detail=True, methods=["get"])
    def analytics(self, request, pk=None):
        """Get campaign analytics."""
        campaign = self.get_object()
        events = campaign.events.all()

        impressions = events.filter(event_type="impression").count()
        clicks = events.filter(event_type="click").count()
        add_to_carts = events.filter(event_type="add_to_cart").count()
        purchases = events.filter(event_type="purchase").count()
        conversion_rate = (purchases / clicks * 100) if clicks > 0 else 0

        return Response({
            "impressions": impressions,
            "clicks": clicks,
            "add_to_carts": add_to_carts,
            "purchases": purchases,
            "spend": str(campaign.spent),
            "conversion_rate": round(conversion_rate, 2),
        })

    @action(detail=True, methods=["post"], permission_classes=[AllowAny])
    def track_event(self, request, pk=None):
        """Track an ad event."""
        campaign = self.get_object()
        if campaign.status != "active":
            return Response({"detail": "Campaign not active"}, status=400)

        event_type = request.data.get("event_type")
        product_id = request.data.get("product_id")

        if event_type not in ["impression", "click", "add_to_cart", "purchase"]:
            return Response({"detail": "Invalid event type"}, status=400)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found"}, status=404)

        AdvertisementEvent.objects.create(
            campaign=campaign,
            event_type=event_type,
            product=product,
        )

        # Update spend
        if event_type == "click":
            campaign.spent += 50
        elif event_type == "purchase":
            campaign.spent += 100

        if campaign.spent >= campaign.budget:
            campaign.status = "completed"
        campaign.save()

        return Response({"detail": "Event tracked"})


# ==========================================
# ADMIN VIEWS
# ==========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    """Admin dashboard stats."""
    if request.user.role != "admin":
        return Response({"detail": "Not authorized"}, status=403)

    from django.db.models import Sum
    total_revenue = Order.objects.filter(
        status="delivered"
    ).aggregate(total=Sum("total"))["total"] or 0

    return Response({
        "total_users": User.objects.count(),
        "total_sellers": SellerProfile.objects.count(),
        "total_products": Product.objects.count(),
        "total_orders": Order.objects.count(),
        "total_revenue": str(total_revenue),
        "active_campaigns": AdvertisementCampaign.objects.filter(status="active").count(),
    })
