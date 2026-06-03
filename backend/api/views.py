from django.contrib.auth.models import User
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Sum, Count, F, Q
from rest_framework_simplejwt.views import TokenObtainPairView
from django.http import HttpResponse
import subprocess
import datetime
import os
from .models import (
    Category, Drug, Staff, Customer, Prescription, PrescriptionItem,
    Sale, SaleItem, SaleReturn, Product, SupermarketSale, SupermarketSaleItem,
    SystemSettings, Expense, ActivityLog, Supplier, Attendance,
    DrugBatch, ProductBatch, PurchaseOrder, PurchaseOrderItem,
    InventoryAudit, InventoryAuditItem, Transaction
)
from .tasks import send_notification_task, broadcast_stock_update
from .serializers import (
    CategorySerializer, DrugSerializer, StaffSerializer, CustomerSerializer,
    PrescriptionSerializer, SaleSerializer, SaleReturnSerializer,
    ProductSerializer, SupermarketSaleSerializer, SystemSettingsSerializer,
    UserProfileSerializer, UserSerializer, ExpenseSerializer,
    MyTokenObtainPairSerializer, ActivityLogSerializer, SupplierSerializer,
    AttendanceSerializer, DrugBatchSerializer, ProductBatchSerializer,
    PurchaseOrderSerializer, TransactionSerializer
)
from .permissions import IsAdminOrPharmacist, IsAdmin

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='collect-payment')
    def collect_payment(self, request, pk=None):
        customer = self.get_object()
        amount = float(request.data.get('amount', 0))
        method = request.data.get('method', 'Cash')

        if amount <= 0:
            return Response({"error": "Invalid amount"}, status=400)

        with transaction.atomic():
            # Reduce balance
            customer.balance -= datetime.Decimal(str(amount))
            customer.save()

            # Record ledger transaction
            Transaction.objects.create(
                customer=customer,
                amount=amount,
                transaction_type='Payment Received',
                method=method,
                notes=f"Payment received for outstanding debt."
            )

            # Log activity
            ActivityLog.objects.create(
                user=request.user,
                action='Debt Payment',
                module='Finance',
                description=f"Collected ${amount} from {customer.first_name}"
            )

        return Response({"message": "Payment recorded", "new_balance": customer.balance})

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAdminOrPharmacist]

    @action(detail=True, methods=['post'], url_path='make-payment')
    def make_payment(self, request, pk=None):
        supplier = self.get_object()
        amount = float(request.data.get('amount', 0))
        method = request.data.get('method', 'Transfer')

        with transaction.atomic():
            supplier.balance -= datetime.Decimal(str(amount))
            supplier.save()
            
            Transaction.objects.create(
                supplier=supplier,
                amount=amount,
                transaction_type='Payment Sent',
                method=method
            )
        return Response({"message": "Payment sent recorded"})

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            data = request.data
            items_data = data.pop('items', [])
            is_credit = data.get('payment_method') == 'Credit'

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            sale = serializer.save()

            if is_credit and sale.customer:
                sale.status = 'Credit'
                sale.customer.balance += sale.total_amount
                sale.customer.save()
                sale.save()

            for item in items_data:
                drug = Drug.objects.get(id=item['drug'])
                qty_to_sell = int(item['quantity'])
                batches = drug.batches.filter(quantity__gt=0, expiry_date__gt=datetime.date.today()).order_by('expiry_date')
                
                for batch in batches:
                    if qty_to_sell <= 0: break
                    sell_from_this_batch = min(batch.quantity, qty_to_sell)
                    SaleItem.objects.create(
                        sale=sale, drug=drug, batch=batch, quantity=sell_from_this_batch,
                        unit_price=item['unit_price'],
                        cost_price=batch.cost_price, # Capture current batch cost
                        subtotal=float(item['unit_price']) * sell_from_this_batch
                    )
                    batch.quantity -= sell_from_this_batch
                    batch.save()
                    qty_to_sell -= sell_from_this_batch

            broadcast_stock_update.delay([item['drug'] for item in items_data], item_type='drug')
            return Response(serializer.data, status=status.HTTP_201_CREATED)

# (Keep existing viewsets for Staff, Attendance, Category, etc.)
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    permission_classes = [IsAdmin]

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class DrugViewSet(viewsets.ModelViewSet):
    queryset = Drug.objects.all()
    serializer_class = DrugSerializer
    permission_classes = [IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().order_by('-created_at')
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAdminOrPharmacist]

    @action(detail=True, methods=['post'], url_path='receive')
    def receive_order(self, request, pk=None):
        order = self.get_object()
        if order.status == 'Received':
            return Response({"error": "Already received"}, status=400)

        with transaction.atomic():
            for item in order.items.all():
                if item.drug:
                    DrugBatch.objects.create(
                        drug=item.drug, batch_number=f"PO-{order.order_id}", quantity=item.quantity,
                        expiry_date=datetime.date.today() + datetime.timedelta(days=365), cost_price=item.unit_cost
                    )

            order.status = 'Received'
            order.received_at = datetime.datetime.now()
            # If not paid immediately, add to supplier balance
            if order.amount_paid < order.total_amount:
                order.supplier.balance += (order.total_amount - order.amount_paid)
                order.supplier.save()
            order.save()
        return Response({"message": "Inventory updated"})

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "healthy"})
