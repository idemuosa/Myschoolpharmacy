from django.contrib import admin
from .models import (
    Category, Drug, Staff, Customer, Prescription,
    PrescriptionItem, Sale, SaleItem, SaleReturn,
    Product, SupermarketSale, SupermarketSaleItem,
    SystemSettings, Expense
)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'type')
    list_filter = ('type',)

@admin.register(Drug)
class DrugAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'dosage', 'stock', 'unit_price', 'expiry_date')
    search_fields = ('name', 'generic_name', 'barcode')
    list_filter = ('category', 'expiry_date')

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone_number', 'role', 'department', 'status')
    search_fields = ('full_name', 'phone_number', 'employee_id')
    list_filter = ('role', 'department', 'status')

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'phone_number', 'customer_id', 'status')
    search_fields = ('first_name', 'last_name', 'phone_number', 'customer_id')

class PrescriptionItemInline(admin.TabularInline):
    model = PrescriptionItem
    extra = 1

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('prescription_id', 'customer', 'status', 'created_at')
    inlines = [PrescriptionItemInline]
    list_filter = ('status', 'created_at')

class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'customer', 'total_amount', 'staff', 'created_at')
    inlines = [SaleItemInline]
    list_filter = ('created_at', 'payment_method')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'stock', 'unit_price', 'expiry_date')
    search_fields = ('name', 'barcode')

class SupermarketSaleItemInline(admin.TabularInline):
    model = SupermarketSaleItem
    extra = 0

@admin.register(SupermarketSale)
class SupermarketSaleAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'total_amount', 'staff', 'created_at')
    inlines = [SupermarketSaleItemInline]
    list_filter = ('created_at',)

@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ('shop_name', 'location', 'phone_number')

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('category', 'amount', 'date', 'staff')
    list_filter = ('category', 'date')
