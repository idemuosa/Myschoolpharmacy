from django.contrib.auth.models import User
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum, Count, F
from .models import Category, Drug, Staff, Customer, Prescription, PrescriptionItem, Sale, SaleItem, SaleReturn, Product, SupermarketSale, SupermarketSaleItem, SystemSettings, Expense
from .serializers import (
    CategorySerializer, DrugSerializer, StaffSerializer, CustomerSerializer,
    PrescriptionSerializer, SaleSerializer, SaleReturnSerializer,
    ProductSerializer, SupermarketSaleSerializer, SystemSettingsSerializer, UserProfileSerializer, UserSerializer, ExpenseSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class DrugViewSet(viewsets.ModelViewSet):
    queryset = Drug.objects.all()
    serializer_class = DrugSerializer

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
                PrescriptionItem.objects.create(
                    prescription=prescription,
                    drug_id=item['drug'],
                    quantity=item['quantity'],
                    directions=item['directions']
                )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

    def create(self, request, *args, **kwargs):
        # Implement atomic transaction for sale and stock update
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
                drug = Drug.objects.get(id=item['drug'])
                if drug.stock < item['quantity']:
                    raise serializers.ValidationError(f"Not enough stock for {drug.name}")
                
                SaleItem.objects.create(
                    sale=sale,
                    drug=drug,
                    quantity=item['quantity'],
                    unit_price=item['unit_price'],
                    subtotal=item['subtotal']
                )
                
                # Update stock
                drug.stock -= item['quantity']
                drug.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

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
        """Get sales statistics for a specific staff member"""
        staff = Staff.objects.get(pk=pk)
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
            
            # Create the return record
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            # Update stock: put items back into inventory
            drug = Drug.objects.get(id=drug_id)
            drug.stock += quantity
            drug.save()

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
        # Only show staff/admin users
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
                product = Product.objects.get(id=item['product'])
                if product.stock < item['quantity']:
                    raise serializers.ValidationError(f"Not enough stock for {product.name}")
                
                SupermarketSaleItem.objects.create(
                    sale=sale,
                    product=product,
                    quantity=item['quantity'],
                    unit_price=item['unit_price'],
                    subtotal=item['subtotal']
                )
                
                # Update stock
                product.stock -= item['quantity']
                product.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

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
    return Response({"status": "healthy", "version": "1.0.2", "message": "Pharmacy API is running"})

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by('-date')
    serializer_class = ExpenseSerializer

    @action(detail=False, methods=['get'], url_path='financial-summary')
    def financial_summary(self, request):
        total_revenue = Sale.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        total_expenses = Expense.objects.aggregate(total=Sum('amount'))['total'] or 0
        net_profit = total_revenue - total_expenses
        
        return Response({
            'total_revenue': total_revenue,
            'total_expenses': total_expenses,
            'net_profit': net_profit,
            'balance': net_profit # "Amount left from selling goods"
        })
