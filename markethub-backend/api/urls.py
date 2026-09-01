"""
MarketHub Backend — API URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

router = DefaultRouter()
router.register(r"sellers", views.SellerProfileViewSet, basename="seller")
router.register(r"categories", views.CategoryViewSet, basename="category")
router.register(r"products", views.ProductViewSet, basename="product")
router.register(r"orders", views.OrderViewSet, basename="order")
router.register(r"campaigns", views.CampaignViewSet, basename="campaign")

urlpatterns = [
    # Auth
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/profile/", views.ProfileView.as_view(), name="profile"),

    # Cart
    path("cart/", views.get_cart, name="get_cart"),
    path("cart/add/", views.add_to_cart, name="add_to_cart"),
    path("cart/<int:item_id>/", views.update_cart_item, name="update_cart_item"),
    path("cart/<int:item_id>/remove/", views.remove_from_cart, name="remove_from_cart"),

    # Admin
    path("admin/dashboard/", views.admin_dashboard, name="admin_dashboard"),

    # Router (products, sellers, orders, categories, campaigns)
    path("", include(router.urls)),
]
