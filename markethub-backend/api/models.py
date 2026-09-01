"""
MarketHub Backend — Models

Database models matching the MarketHub schema.
"""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


def generate_order_number():
    """Generate a unique order number like MH-20240101-A1B2C3."""
    import datetime
    today = datetime.date.today().strftime("%Y%m%d")
    random_part = uuid.uuid4().hex[:6].upper()
    return f"MH-{today}-{random_part}"


# ==========================================
# USER
# ==========================================
class User(AbstractUser):
    """Extended user model with MarketHub roles."""
    ROLE_CHOICES = [
        ("customer", "Customer"),
        ("seller", "Seller"),
        ("admin", "Admin"),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="customer")
    phone = models.CharField(max_length=20, blank=True, default="")
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, default="")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.username} ({self.role})"


# ==========================================
# SELLER PROFILE
# ==========================================
class SellerProfile(models.Model):
    """Business profile for sellers."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="seller_profile")
    business_name = models.CharField(max_length=200)
    business_description = models.TextField(blank=True, default="")
    logo = models.ImageField(upload_to="seller_logos/", blank=True, null=True)
    location = models.CharField(max_length=200)
    is_verified = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "seller_profiles"

    def __str__(self):
        return self.business_name


# ==========================================
# CATEGORY
# ==========================================
class Category(models.Model):
    """Product category."""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, default="")
    icon = models.CharField(max_length=50, blank=True, default="")
    parent_category = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children"
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "categories"
        ordering = ["sort_order"]

    def __str__(self):
        return self.name


# ==========================================
# PRODUCT
# ==========================================
class Product(models.Model):
    """Listed product."""
    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="TZS")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    stock_quantity = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.IntegerField(default=0)
    total_sales = models.IntegerField(default=0)
    location = models.CharField(max_length=200, blank=True, default="")
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "products"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


# ==========================================
# PRODUCT IMAGE
# ==========================================
class ProductImage(models.Model):
    """Product image."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/")
    alt = models.CharField(max_length=200, blank=True, default="")
    sort_order = models.IntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "product_images"
        ordering = ["sort_order"]


# ==========================================
# CART
# ==========================================
class Cart(models.Model):
    """Shopping cart (one per user)."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "carts"

    @property
    def subtotal(self):
        return sum(item.line_total for item in self.items.all())

    @property
    def item_count(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    """Item in a cart."""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "cart_items"
        unique_together = ["cart", "product"]

    @property
    def line_total(self):
        return self.product.price * self.quantity


# ==========================================
# ORDER
# ==========================================
class Order(models.Model):
    """Customer order."""
    STATUS_CHOICES = [
        ("pending_payment", "Pending Payment"),
        ("paid", "Paid"),
        ("confirmed", "Confirmed"),
        ("processing", "Processing"),
        ("ready_for_delivery", "Ready for Delivery"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
    ]

    order_number = models.CharField(max_length=30, unique=True, default=generate_order_number)
    customer = models.ForeignKey(User, on_delete=models.PROTECT, related_name="orders")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending_payment")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=12, decimal_places=2, default=2000)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="TZS")
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20)
    delivery_address = models.TextField()
    delivery_location = models.CharField(max_length=200, blank=True, default="")
    payment_method = models.CharField(max_length=30)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.order_number}"


# ==========================================
# ORDER ITEM
# ==========================================
class OrderItem(models.Model):
    """Line item in an order."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    seller = models.ForeignKey(SellerProfile, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=200)
    product_image = models.CharField(max_length=500, blank=True, default="")
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="TZS")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "order_items"


# ==========================================
# PAYMENT
# ==========================================
class Payment(models.Model):
    """Payment record."""
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="TZS")
    method = models.CharField(max_length=30)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="pending")
    transaction_id = models.CharField(max_length=200, blank=True, default="")
    provider_reference = models.CharField(max_length=200, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments"


# ==========================================
# ADVERTISEMENT CAMPAIGN
# ==========================================
class AdvertisementCampaign(models.Model):
    """Advertising campaign by a seller."""
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("active", "Active"),
        ("paused", "Paused"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    seller = models.ForeignKey(SellerProfile, on_delete=models.CASCADE, related_name="campaigns")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="campaigns")
    name = models.CharField(max_length=100)
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="TZS")
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="draft")
    target_location = models.CharField(max_length=200, blank=True, default="")
    target_category = models.CharField(max_length=200, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "advertisement_campaigns"

    def __str__(self):
        return self.name


# ==========================================
# ADVERTISEMENT EVENT
# ==========================================
class AdvertisementEvent(models.Model):
    """Tracking event for ad campaigns."""
    EVENT_TYPES = [
        ("impression", "Impression"),
        ("click", "Click"),
        ("add_to_cart", "Add to Cart"),
        ("purchase", "Purchase"),
    ]

    campaign = models.ForeignKey(
        AdvertisementCampaign, on_delete=models.CASCADE, related_name="events"
    )
    event_type = models.CharField(max_length=15, choices=EVENT_TYPES)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "advertisement_events"
