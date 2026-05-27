from django.contrib.auth.models import User
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Sum, Count, F
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Category, Drug, Staff, Customer, Prescription, PrescriptionItem, Sale, SaleItem, SaleReturn, Product, SupermarketSale, SupermarketSaleItem, SystemSettings, Expense, ActivityLog
from .tasks import send_notification_task, broadcast_stock_update
from .serializers import (
    CategorySerializer, DrugSerializer, StaffSerializer, CustomerSerializer,
    PrescriptionSerializer, SaleSerializer, SaleReturnSerializer,
    ProductSerializer, SupermarketSaleSerializer, SystemSettingsSerializer,
    UserProfileSerializer, UserSerializer, ExpenseSerializer,
    MyTokenObtainPairSerializer, ActivityLogSerializer
)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class DrugViewSet(viewsets.ModelViewSet):
    queryset = Drug.objects.all()
    serializer_class = DrugSerializer

    def perform_create(self, serializer):
        drug = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action='Create Drug',
            module='Inventory',
            description=f"Added new drug: {drug.name}"
        )

    def perform_update(self, serializer):
        drug = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action='Update Drug',
            module='Inventory',
            description=f"Updated drug details for: {drug.name}"
        )

class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        queryset = Prescription.objects.all().order_by('-created_at')
        customer_id = self.request.query_params.get('customer')
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        return queryset

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            data = request.data
            items_data = data.pop('items', [])
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            prescription = serializer.save()

            for item in items_data:
                if not Drug.objects.filter(id=item['drug']).exists():
                    raise serializers.ValidationError(f"Drug with ID {item['drug']} does not exist.")

                PrescriptionItem.objects.create(
                    prescription=prescription,
                    drug_id=item['drug'],
                    quantity=item['quantity'],
                    directions=item['directions']
                )

            full_serializer = self.get_serializer(prescription)
            return Response(full_serializer.data, status=status.HTTP_201_CREATED)

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            data = request.data
            items_data = data.pop('items', [])
            staff_id = data.get('staff')
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            sale = serializer.save()

            if staff_id:
                sale.staff_id = staff_id
                sale.save()

            for item in items_data:
                try:
                    drug = Drug.objects.get(id=item['drug'])
                except Drug.DoesNotExist:
                    raise serializers.ValidationError(f"Medication ID {item['drug']} not found in inventory.")
                
                if drug.stock < item['quantity']:
                    raise serializers.ValidationError(f"Insufficient stock for {drug.name}. Requested: {item['quantity']}, Available: {drug.stock}")
                
                SaleItem.objects.create(
                    sale=sale,
                    drug=drug,
                    quantity=item['quantity'],
                    unit_price=item['unit_price'],
                    subtotal=item['subtotal']
                )
                
                drug.stock -= item['quantity']
                drug.save()

            drug_ids = [item['drug'] for item in items_data]
            broadcast_stock_update.delay(drug_ids, item_type='drug')

            full_serializer = self.get_serializer(sale)
            return Response(full_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        total_revenue = Sale.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        total_transactions = Sale.objects.count()
        low_stock_count = Drug.objects.filter(stock__lte=F('reorder_level')).count()
        
        return Response({
            'total_revenue': total_revenue,
            'total_transactions': total_transactions,
            'low_stock_count': low_stock_count,
        })

    @action(detail=True, methods=['get'], url_path='sales-stats')
    def sales_stats(self, request, pk=None):
        staff = get_object_or_404(Staff, pk=pk)
        sales = Sale.objects.filter(staff=staff)
        
        total_revenue = sales.aggregate(total=Sum('total_amount'))['total'] or 0
        customer_count = sales.values('customer').distinct().count()
        transaction_count = sales.count()
        
        return Response({
            'staff_name': staff.full_name,
            'total_revenue': total_revenue,
            'customer_count': customer_count,
            'transaction_count': transaction_count
        })

class SaleReturnViewSet(viewsets.ModelViewSet):
    queryset = SaleReturn.objects.all()
    serializer_class = SaleReturnSerializer

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            data = request.data
            drug_id = data.get('drug')
            quantity = int(data.get('quantity', 0))
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            drug = get_object_or_404(Drug, id=drug_id)
            drug.stock += quantity
            drug.save()

            ActivityLog.objects.create(
                user=self.request.user if self.request.user.is_authenticated else None,
                action='Process Return',
                module='Sales',
                description=f"Returned {quantity} units of {drug.name}"
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class SystemSettingsViewSet(viewsets.ModelViewSet):
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer

    def get_authenticators(self):
        if getattr(self, 'action', None) in ['list', 'retrieve']:
            return []
        return super().get_authenticators()

    def get_permissions(self):
        if getattr(self, 'action', None) in ['list', 'retrieve']:
            return [AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        if not SystemSettings.objects.exists():
            SystemSettings.objects.create(shop_name='Josiah Pharmacy and Stores', location="St. Mary's")
        return SystemSettings.objects.all()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_staff=True)
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(is_staff=True)

@api_view(['POST'])
def update_profile(request):
    user = request.user
    serializer = UserProfileSerializer(user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({'message': 'Admin profile updated successfully'})

class SupermarketSaleViewSet(viewsets.ModelViewSet):
    queryset = SupermarketSale.objects.all()
    serializer_class = SupermarketSaleSerializer

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            data = request.data
            items_data = data.pop('items', [])
            staff_id = data.get('staff')
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            sale = serializer.save()

            if staff_id:
                sale.staff_id = staff_id
                sale.save()

            for item in items_data:
                try:
                    product = Product.objects.get(id=item['product'])
                except Product.DoesNotExist:
                    raise serializers.ValidationError(f"Product ID {item['product']} not found in supermarket inventory.")
                
                if product.stock < item['quantity']:
                    raise serializers.ValidationError(f"Insufficient stock for {product.name}. Requested: {item['quantity']}, Available: {product.stock}")
                
                SupermarketSaleItem.objects.create(
                    sale=sale,
                    product=product,
                    quantity=item['quantity'],
                    unit_price=item['unit_price'],
                    subtotal=item['subtotal']
                )
                
                product.stock -= item['quantity']
                product.save()

            product_ids = [item['product'] for item in items_data]
            broadcast_stock_update.delay(product_ids, item_type='product')

            full_serializer = self.get_serializer(sale)
            return Response(full_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        total_revenue = SupermarketSale.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        total_transactions = SupermarketSale.objects.count()
        low_stock_count = Product.objects.filter(stock__lte=F('reorder_level')).count()
        
        return Response({
            'total_revenue': total_revenue,
            'total_transactions': total_transactions,
            'low_stock_count': low_stock_count,
        })

class ReportsView(viewsets.ViewSet):
    def list(self, request):
        return Response({"message": "Reporting API Active"})

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        total_revenue = Sale.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        total_transactions = Sale.objects.count()
        low_stock_count = Drug.objects.filter(stock__lte=F('reorder_level')).count()
        
        return Response({
            'total_revenue': total_revenue,
            'total_transactions': total_transactions,
            'low_stock_count': low_stock_count,
        })

    @action(detail=False, methods=['get'], url_path='sales')
    def sales_report(self, request):
        sales = Sale.objects.all().order_by('-created_at')
        serializer = SaleSerializer(sales, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='inventory-turnover')
    def inventory_turnover(self, request):
        drugs = Drug.objects.all()
        serializer = DrugSerializer(drugs, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    username = request.data.get('username', '').lower()
    if not username:
        return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(username=username)
        if user.is_staff:
            user.set_password('admin123')
            user.save()
            return Response({'message': f'Password for {username} has been reset to admin123'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Unauthorized: Only staff accounts can be reset.'}, status=status.HTTP_403_FORBIDDEN)
    except User.DoesNotExist:
        return Response({'error': f'User {username} not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "healthy", "version": "1.1.0", "message": "Pharmacy API is running"})

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by('-date')
    serializer_class = ExpenseSerializer

    @action(detail=False, methods=['get'], url_path='financial-summary')
    def financial_summary(self, request):
        pharmacy_revenue = Sale.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        supermarket_revenue = SupermarketSale.objects.aggregate(total=Sum('total_amount'))['total'] or 0

        total_revenue = pharmacy_revenue + supermarket_revenue
        total_expenses = Expense.objects.aggregate(total=Sum('amount'))['total'] or 0

        total_sales_count = Sale.objects.count() + SupermarketSale.objects.count()
        profit = total_revenue - total_expenses

        from django.db.models.functions import TruncMonth
        monthly_revenue = Sale.objects.annotate(month=TruncMonth('created_at')).values('month').annotate(total=Sum('total_amount')).order_by('month')

        chart_data = [
            {"month": item['month'].strftime('%b'), "revenue": float(item['total'])}
            for item in monthly_revenue
        ]

        return Response({
            'total_revenue': float(total_revenue),
            'total_expenses': float(total_expenses),
            'net_profit': float(profit),
            'balance': float(profit),
            'sales_count': total_sales_count,
            'pharmacy_revenue': float(pharmacy_revenue),
            'supermarket_revenue': float(supermarket_revenue),
            'chart_data': chart_data
        })

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all().order_by('-timestamp')
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
