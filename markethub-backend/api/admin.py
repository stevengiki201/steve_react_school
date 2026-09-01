"""
MarketHub Backend — Admin Configuration
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, SellerProfile, Category, Product, ProductImage,
    Cart, CartItem, Order, OrderItem, Payment,
    AdvertisementCampaign, AdvertisementEvent,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "email", "role", "is_active", "date_joined"]
    list_filter = ["role", "is_active"]
    fieldsets = BaseUserAdmin.fieldsets + (
        ("MarketHub", {"fields": ("role", "phone", "location")}),
    )


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ["business_name", "user", "location", "is_verified", "rating"]
    list_filter = ["is_verified", "is_active"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "is_active", "sort_order"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "seller", "price", "stock_quantity", "is_active", "is_featured"]
    list_filter = ["is_active", "is_featured", "category"]
    search_fields = ["name", "description"]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ["product", "is_primary", "sort_order"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_number", "customer", "status", "total", "created_at"]
    list_filter = ["status"]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["order", "product_name", "quantity", "unit_price"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["order", "amount", "method", "status"]


@admin.register(AdvertisementCampaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ["name", "seller", "product", "budget", "spent", "status"]
    list_filter = ["status"]
