from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Category, Drug, Staff, Customer, Prescription, PrescriptionItem, Sale, SaleItem, SaleReturn, Product, SupermarketSale, SupermarketSaleItem, SystemSettings, Expense

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        role = "Admin" if user.is_superuser else "Staff"
        department = "Management" if user.is_superuser else "General"
        full_name = user.get_full_name() or user.username

        try:
            staff = Staff.objects.filter(employee_id__iexact=user.username).first()
            if not staff and user.email:
                staff = Staff.objects.filter(email__iexact=user.email).first()

            if staff:
                role = staff.role or role
                department = staff.department or department
                full_name = staff.full_name or full_name
        except Exception:
            pass

        is_admin = bool(user.is_superuser or (role and str(role).lower() in ['admin', 'administrator', 'manager', 'director']))

        data['username'] = user.username
        data['role'] = role
        data['department'] = department
        data['full_name'] = full_name
        data['is_admin'] = is_admin
        data['is_staff'] = user.is_staff
        return data

class CategorySerializer(serializers.ModelSerializer):
    type = serializers.CharField(max_length=50, required=False, default='Pharmacy', allow_blank=True)

    class Meta:
        model = Category
        fields = '__all__'

    def validate(self, attrs):
        name = attrs.get('name', '').strip() if attrs.get('name') else ''
        cat_type = attrs.get('type')
        if not cat_type or not str(cat_type).strip():
            cat_type = 'Pharmacy'
        else:
            cat_type = str(cat_type).strip()

        if not name:
            raise serializers.ValidationError({'name': 'Category name cannot be empty.'})

        attrs['name'] = name
        attrs['type'] = cat_type

        # Check for duplicate category (case-insensitive) for the same type
        queryset = Category.objects.filter(name__iexact=name, type__iexact=cat_type)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError({'name': f'A category named "{name}" already exists in {cat_type}.'})

        return attrs

class DrugSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Drug
        fields = '__all__'

    def get_category_name(self, obj):
        if obj.category_obj:
            return obj.category_obj.name
        return obj.category or ""

    def validate_barcode(self, value):
        if value is None or (isinstance(value, str) and value.strip() == ""):
            return None
        return value.strip()

    def create(self, validated_data):
        category_obj = validated_data.get('category_obj')
        if category_obj and not validated_data.get('category'):
            validated_data['category'] = category_obj.name
        elif not category_obj and validated_data.get('category'):
            cat = Category.objects.filter(name__iexact=validated_data['category'].strip(), type='Pharmacy').first()
            if cat:
                validated_data['category_obj'] = cat
        return super().create(validated_data)

    def update(self, instance, validated_data):
        category_obj = validated_data.get('category_obj')
        if category_obj:
            validated_data['category'] = category_obj.name
        elif validated_data.get('category'):
            cat = Category.objects.filter(name__iexact=validated_data['category'].strip(), type='Pharmacy').first()
            if cat:
                validated_data['category_obj'] = cat
        return super().update(instance, validated_data)

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'

    def create(self, validated_data):
        # Create the staff member first
        staff = Staff.objects.create(**validated_data)
        
        # Automatically create a corresponding Django User for login
        # We use employee_id as username and a default password
        username = staff.employee_id.lower()
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(
                username=username,
                email=staff.email,
                password='admin123',
                is_staff=True # Allow access to staff features
            )
        return staff

    def update(self, instance, validated_data):
        old_employee_id = instance.employee_id
        old_email = instance.email

        staff = super().update(instance, validated_data)

        # Sync associated Django User if employee_id or email changed
        new_username = staff.employee_id.lower() if staff.employee_id else ""
        old_username = old_employee_id.lower() if old_employee_id else new_username

        user = User.objects.filter(username=old_username).first()
        if not user and old_email:
            user = User.objects.filter(email__iexact=old_email).first()

        if user:
            if new_username and user.username != new_username and not User.objects.filter(username=new_username).exists():
                user.username = new_username
            if staff.email and user.email != staff.email:
                user.email = staff.email
            user.save()

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
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_category_name(self, obj):
        if obj.category_obj:
            return obj.category_obj.name
        return obj.category or ""

    def validate_barcode(self, value):
        if value is None or (isinstance(value, str) and value.strip() == ""):
            return None
        return value.strip()

    def create(self, validated_data):
        category_obj = validated_data.get('category_obj')
        if category_obj and not validated_data.get('category'):
            validated_data['category'] = category_obj.name
        elif not category_obj and validated_data.get('category'):
            cat = Category.objects.filter(name__iexact=validated_data['category'].strip(), type='Supermarket').first()
            if cat:
                validated_data['category_obj'] = cat
        return super().create(validated_data)

    def update(self, instance, validated_data):
        category_obj = validated_data.get('category_obj')
        if category_obj:
            validated_data['category'] = category_obj.name
        elif validated_data.get('category'):
            cat = Category.objects.filter(name__iexact=validated_data['category'].strip(), type='Supermarket').first()
            if cat:
                validated_data['category_obj'] = cat
        return super().update(instance, validated_data)

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
