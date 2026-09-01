"""
MarketHub Backend — Serializers
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    SellerProfile, Category, Product, ProductImage,
    Cart, CartItem, Order, OrderItem, Payment,
    AdvertisementCampaign, AdvertisementEvent,
)

User = get_user_model()


# ==========================================
# AUTH / USER
# ==========================================
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role", "phone"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        # Auto-create seller profile if role is seller
        if user.role == "seller":
            SellerProfile.objects.create(
                user=user,
                business_name=f"{user.username}'s Store",
                location="Tanzania",
            )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "role", "phone",
            "avatar", "location", "is_active", "date_joined",
        ]
        read_only_fields = ["id", "date_joined"]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["name", "phone", "location", "avatar"]
        # Note: 'name' maps to first_name for Django User
        extra_kwargs = {
            "phone": {"required": False},
            "location": {"required": False},
            "avatar": {"required": False},
        }

    def update(self, instance, validated_data):
        name = validated_data.pop("name", None)
        if name:
            parts = name.split(" ", 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ""
        return super().update(instance, validated_data)


# ==========================================
# SELLER PROFILE
# ==========================================
class SellerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SellerProfile
        fields = [
            "id", "user", "business_name", "business_description", "logo",
            "location", "is_verified", "rating", "total_sales",
            "total_orders", "is_active", "created_at",
        ]
        read_only_fields = ["id", "is_verified", "rating", "total_sales", "total_orders", "created_at"]


class SellerProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = ["business_name", "business_description", "logo", "location"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


# ==========================================
# CATEGORY
# ==========================================
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id", "name", "slug", "description", "icon",
            "parent_category", "is_active", "sort_order",
        ]
        read_only_fields = ["id"]


# ==========================================
# PRODUCT
# ==========================================
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt", "sort_order", "is_primary"]
        read_only_fields = ["id"]


class ProductListSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    seller_name = serializers.CharField(source="seller.business_name", read_only=True)
    seller_verified = serializers.BooleanField(source="seller.is_verified", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "price", "currency", "stock_quantity",
            "is_active", "is_featured", "average_rating", "total_reviews",
            "total_sales", "location", "created_at",
            "images", "seller_name", "seller_verified", "category",
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    seller = SellerProfileSerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "description", "price", "currency",
            "stock_quantity", "is_active", "is_featured", "average_rating",
            "total_reviews", "total_sales", "location", "tags",
            "created_at", "updated_at",
            "images", "seller", "category",
        ]


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "name", "description", "price", "category",
            "stock_quantity", "location", "tags",
        ]

    def create(self, validated_data):
        import re
        from django.utils.text import slugify

        request = self.context["request"]
        user = request.user
        seller_profile = SellerProfile.objects.get(user=user)

        # Generate unique slug
        base_slug = slugify(validated_data["name"])
        slug = base_slug
        counter = 1
        while Product.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        validated_data["seller"] = seller_profile
        validated_data["slug"] = slug
        validated_data["currency"] = "TZS"
        return super().create(validated_data)


# ==========================================
# CART
# ==========================================
class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_price = serializers.DecimalField(
        source="product.price", max_digits=12, decimal_places=2, read_only=True
    )
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity", "product_name", "product_price", "product_slug", "line_total"]
        read_only_fields = ["id"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "items", "subtotal", "item_count", "created_at"]
        read_only_fields = ["id", "created_at"]


# ==========================================
# ORDER
# ==========================================
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id", "product", "product_name", "product_image",
            "quantity", "unit_price", "total_price", "currency",
        ]


class OrderListSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "status", "subtotal", "delivery_fee",
            "total", "currency", "customer_name", "created_at", "items",
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "status", "subtotal", "delivery_fee",
            "total", "currency", "customer_name", "customer_phone",
            "delivery_address", "delivery_location", "payment_method",
            "notes", "created_at", "updated_at", "items",
        ]


class OrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=200)
    customer_phone = serializers.CharField(max_length=20)
    delivery_address = serializers.CharField()
    delivery_location = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.CharField()
    notes = serializers.CharField(required=False, allow_blank=True)


# ==========================================
# PAYMENT
# ==========================================
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id", "order", "amount", "currency", "method",
            "status", "transaction_id", "created_at",
        ]


# ==========================================
# ADVERTISEMENT
# ==========================================
class CampaignSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = AdvertisementCampaign
        fields = [
            "id", "product", "product_name", "name", "budget", "spent",
            "currency", "start_date", "end_date", "status",
            "target_location", "target_category", "created_at",
        ]
        read_only_fields = ["id", "spent", "created_at"]


class CampaignDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = AdvertisementCampaign
        fields = [
            "id", "product", "product_name", "name", "budget", "spent",
            "currency", "start_date", "end_date", "status",
            "target_location", "target_category", "created_at", "updated_at",
        ]
