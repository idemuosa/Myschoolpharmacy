from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, DrugViewSet, StaffViewSet, CustomerViewSet, 
    PrescriptionViewSet, SaleViewSet, SaleReturnViewSet, ProductViewSet, 
    SupermarketSaleViewSet, reset_password, SystemSettingsViewSet, 
    update_profile, ReportsView, UserViewSet, health_check, ExpenseViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'categories', CategoryViewSet)
router.register(r'settings', SystemSettingsViewSet)
router.register(r'drugs', DrugViewSet)
router.register(r'staff', StaffViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'prescriptions', PrescriptionViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'returns', SaleReturnViewSet)
router.register(r'products', ProductViewSet)
router.register(r'supermarket-sales', SupermarketSaleViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'reports', ReportsView, basename='reports')

urlpatterns = [
    path('', include(router.urls)),
    path('reset-password/', reset_password, name='reset-password'),
    path('update-profile/', update_profile, name='update-profile'),
    path('health-check/', health_check, name='health-check'),
]
