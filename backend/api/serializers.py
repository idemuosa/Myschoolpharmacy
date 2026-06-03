from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import transaction
from .models import (
    Category, Drug, Staff, Customer, Prescription, PrescriptionItem,
    Sale, SaleItem, SaleReturn, Product, SupermarketSale, SupermarketSaleItem,
    SystemSettings, Expense, ActivityLog, Supplier, Attendance,
    DrugBatch, ProductBatch, PurchaseOrder, PurchaseOrderItem, Transaction
)

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    ledger = TransactionSerializer(many=True, read_only=True)
    class Meta:
        model = Customer
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    ledger = TransactionSerializer(many=True, read_only=True)
    class Meta:
        model = Supplier
        fields = '__all__'

# ... (Keep other serializers from previous implementations)
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        try:
            staff = Staff.objects.get(phone_number=user.username)
            token['role'] = staff.role
            token['full_name'] = staff.full_name
        except Staff.DoesNotExist:
            token['role'] = 'Admin' if user.is_superuser else 'Staff'
            token['full_name'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        try:
            staff = Staff.objects.get(phone_number=self.user.username)
            data['role'] = staff.role
            data['full_name'] = staff.full_name
            data['staff_id'] = staff.id
        except Staff.DoesNotExist:
            data['role'] = 'Admin' if self.user.is_superuser else 'Staff'
            data['full_name'] = self.user.username
            data['staff_id'] = None
        return data

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class DrugBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrugBatch
        fields = '__all__'

class DrugSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category_obj.name')
    supplier_name = serializers.ReadOnlyField(source='supplier.name')
    total_stock = serializers.ReadOnlyField()
    batches = DrugBatchSerializer(many=True, read_only=True)
    class Meta:
        model = Drug
        fields = '__all__'

class SaleItemSerializer(serializers.ModelSerializer):
    drug_name = serializers.ReadOnlyField(source='drug.name')
    class Meta:
        model = SaleItem
        fields = ['id', 'sale', 'drug', 'drug_name', 'batch', 'quantity', 'unit_price', 'subtotal']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    staff_name = serializers.ReadOnlyField(source='staff.full_name')
    customer_name = serializers.ReadOnlyField(source='customer.first_name')
    class Meta:
        model = Sale
        fields = ['id', 'transaction_id', 'customer', 'customer_name', 'total_amount', 'amount_paid', 'payment_method', 'status', 'staff', 'staff_name', 'created_at', 'items']

# (Rest of the serializers as before...)
class ProductBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductBatch
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category_obj.name')
    total_stock = serializers.ReadOnlyField()
    batches = ProductBatchSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = '__all__'

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'

class PurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrder
        fields = '__all__'
