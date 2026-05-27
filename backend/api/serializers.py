from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Category, Drug, Staff, Customer, Prescription, PrescriptionItem, Sale, SaleItem, SaleReturn, Product, SupermarketSale, SupermarketSaleItem, SystemSettings, Expense, ActivityLog

class ActivityLogSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'username', 'action', 'module', 'description', 'timestamp']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
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
            # Fallback for admin user or users created without staff profile
            data['role'] = 'Admin' if self.user.is_superuser else 'Staff'
            data['full_name'] = self.user.username
            data['staff_id'] = None
        return data

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class DrugSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category_obj.name')
    class Meta:
        model = Drug
        fields = '__all__'

    def validate_barcode(self, value):
        if value is None or (isinstance(value, str) and value.strip() == ""):
            return None
        return value.strip()

from django.db import transaction

class StaffSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Staff
        fields = ['id', 'full_name', 'email', 'phone_number', 'role', 'department', 'employee_id', 'photo', 'status', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password', 'admin123')

        with transaction.atomic():
            # Create the staff member first
            staff = Staff.objects.create(**validated_data)

            # Automatically create a corresponding Django User for login
            # We use phone_number as username
            username = staff.phone_number.strip()

            if User.objects.filter(username=username).exists():
                raise serializers.ValidationError({"phone_number": "This phone number is already registered as a system user."})

            User.objects.create_user(
                username=username,
                email=staff.email,
                password=password,
                is_staff=True # Allow access to staff features
            )
            return staff

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class PrescriptionItemSerializer(serializers.ModelSerializer):
    drug_name = serializers.ReadOnlyField(source='drug.name')
    drug_dosage = serializers.ReadOnlyField(source='drug.dosage')
    
    class Meta:
        model = PrescriptionItem
        fields = ['id', 'prescription', 'drug', 'drug_name', 'drug_dosage', 'quantity', 'refills', 'directions']

class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True, read_only=True)

    class Meta:
        model = Prescription
        fields = '__all__'

class SaleItemSerializer(serializers.ModelSerializer):
    drug_name = serializers.ReadOnlyField(source='drug.name')
    class Meta:
        model = SaleItem
        fields = ['id', 'sale', 'drug', 'drug_name', 'quantity', 'unit_price', 'subtotal']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    staff_name = serializers.ReadOnlyField(source='staff.full_name')
    customer_name = serializers.ReadOnlyField(source='customer.first_name') # Simplifying to first name or you could use a method

    class Meta:
        model = Sale
        fields = ['id', 'transaction_id', 'customer', 'customer_name', 'total_amount', 'payment_method', 'staff', 'staff_name', 'created_at', 'items']

class SaleReturnSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleReturn
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category_obj.name')
    class Meta:
        model = Product
        fields = '__all__'

    def validate_barcode(self, value):
        if value is None or (isinstance(value, str) and value.strip() == ""):
            return None
        return value.strip()

class SupermarketSaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    class Meta:
        model = SupermarketSaleItem
        fields = ['id', 'sale', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal']

class SupermarketSaleSerializer(serializers.ModelSerializer):
    items = SupermarketSaleItemSerializer(many=True, read_only=True)
    staff_name = serializers.ReadOnlyField(source='staff.full_name')

    class Meta:
        model = SupermarketSale
        fields = ['id', 'transaction_id', 'total_amount', 'payment_method', 'staff', 'staff_name', 'created_at', 'items']

class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def update(self, instance, validated_data):
        if 'password' in validated_data and validated_data['password']:
            password = validated_data.pop('password')
            instance.set_password(password)
        elif 'password' in validated_data:
            validated_data.pop('password')
        return super().update(instance, validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'is_staff']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            is_staff=True # Admins are staff
        )
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data and validated_data['password']:
            password = validated_data.pop('password')
            instance.set_password(password)
        elif 'password' in validated_data:
            validated_data.pop('password')
        return super().update(instance, validated_data)

class ExpenseSerializer(serializers.ModelSerializer):
    staff_name = serializers.ReadOnlyField(source='staff.full_name')
    class Meta:
        model = Expense
        fields = '__all__'
