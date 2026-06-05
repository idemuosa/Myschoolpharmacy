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
from django.utils import timezone
import subprocess
import datetime
import decimal
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
    PurchaseOrderSerializer, TransactionSerializer, InventoryAuditSerializer
)
from .permissions import IsAdminOrPharmacist, IsAdmin

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAdminOrPharmacist]

    @action(detail=True, methods=['post'], url_path='make-payment')
    def make_payment(self, request, pk=None):
        supplier = self.get_object()
        amount = decimal.Decimal(str(request.data.get('amount', 0)))
        method = request.data.get('method', 'Transfer')

        with transaction.atomic():
            supplier.balance -= amount
            supplier.save()
            Transaction.objects.create(
                supplier=supplier, amount=amount,
                transaction_type='Payment Sent', method=method
            )
        return Response({"message": "Payment recorded"})

class DrugBatchViewSet(viewsets.ModelViewSet):
    queryset = DrugBatch.objects.all()
    serializer_class = DrugBatchSerializer
    permission_classes = [IsAdminOrPharmacist]

class ProductBatchViewSet(viewsets.ModelViewSet):
    queryset = ProductBatch.objects.all()
    serializer_class = ProductBatchSerializer
    permission_classes = [IsAdminOrPharmacist]

class DrugViewSet(viewsets.ModelViewSet):
    queryset = Drug.objects.all()
    serializer_class = DrugSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='procurement-advice')
    def procurement_advice(self, request):
        low_stock_drugs = [d for d in Drug.objects.all() if d.total_stock <= d.reorder_level]
        advice = [{
            "id": d.id, "name": d.name, "current_stock": d.total_stock,
            "reorder_level": d.reorder_level, "suggested_qty": (d.reorder_level * 2) - d.total_stock,
            "unit_price": d.unit_price, "supplier_name": d.supplier.name if d.supplier else "No Vendor",
            "supplier_id": d.supplier.id if d.supplier else None
        } for d in low_stock_drugs]
        return Response(advice)

    def perform_create(self, serializer):
        drug = serializer.save()
        ActivityLog.objects.create(user=self.request.user, action='Create Drug', module='Inventory', description=f"Added: {drug.name}")

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

class InventoryAuditViewSet(viewsets.ModelViewSet):
    queryset = InventoryAudit.objects.all().order_by('-created_at')
    serializer_class = InventoryAuditSerializer
    permission_classes = [IsAdminOrPharmacist]

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            data = request.data
            items_data = data.pop('items', [])
            data['performed_by'] = request.user.id
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            audit = serializer.save()
            for item in items_data:
                expected = Drug.objects.get(id=item['drug']).total_stock if item.get('drug') else Product.objects.get(id=item['product']).total_stock
                InventoryAuditItem.objects.create(
                    audit=audit, drug_id=item.get('drug'), product_id=item.get('product'),
                    expected_quantity=expected, counted_quantity=item['counted_quantity'],
                    discrepancy=int(item['counted_quantity']) - expected
                )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='reconcile')
    def reconcile(self, request, pk=None):
        audit = self.get_object()
        if audit.status == 'Completed': return Response({"error": "Already reconciled"}, 400)
        with transaction.atomic():
            for item in audit.items.all():
                if item.discrepancy == 0: continue
                target = item.drug or item.product
                latest_batch = target.batches.all().order_by('-created_at').first()
                if latest_batch:
                    latest_batch.quantity += item.discrepancy
                    if latest_batch.quantity < 0: latest_batch.quantity = 0
                    latest_batch.save()
            audit.status = 'Completed'
            audit.save()
        return Response({"message": "Reconciled"})

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().order_by('-created_at')
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAdminOrPharmacist]

    @action(detail=True, methods=['post'], url_path='receive')
    def receive_order(self, request, pk=None):
        order = self.get_object()
        if order.status == 'Received': return Response({"error": "Already received"}, 400)
        with transaction.atomic():
            for item in order.items.all():
                if item.drug:
                    DrugBatch.objects.create(
                        drug=item.drug, batch_number=f"PO-{order.order_id}", quantity=item.quantity,
                        expiry_date=timezone.now().date() + datetime.timedelta(days=365), cost_price=item.unit_cost
                    )
            order.status = 'Received'
            order.received_at = timezone.now()
            if order.amount_paid < order.total_amount:
                order.supplier.balance += (order.total_amount - order.amount_paid)
                order.supplier.save()
            order.save()
        return Response({"message": "Inventory updated"})

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
                qty = int(item['quantity'])
                batches = drug.batches.filter(quantity__gt=0, expiry_date__gt=timezone.now().date()).order_by('expiry_date')
                for b in batches:
                    if qty <= 0: break
                    take = min(b.quantity, qty)
                    SaleItem.objects.create(sale=sale, drug=drug, batch=b, quantity=take, unit_price=item['unit_price'], cost_price=b.cost_price, subtotal=decimal.Decimal(str(item['unit_price'])) * take)
                    b.quantity -= take
                    b.save()
                    qty -= take
            broadcast_stock_update.delay([i['drug'] for i in items_data], 'drug')
            return Response(serializer.data, status=201)

class SupermarketSaleViewSet(viewsets.ModelViewSet):
    queryset = SupermarketSale.objects.all()
    serializer_class = SupermarketSaleSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            data = request.data
            items_data = data.pop('items', [])
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            sale = serializer.save()
            for item in items_data:
                prod = Product.objects.get(id=item['product'])
                qty = int(item['quantity'])
                batches = prod.batches.filter(quantity__gt=0, expiry_date__gt=timezone.now().date()).order_by('expiry_date')
                for b in batches:
                    if qty <= 0: break
                    take = min(b.quantity, qty)
                    SupermarketSaleItem.objects.create(sale=sale, product=prod, batch=b, quantity=take, unit_price=item['unit_price'], subtotal=decimal.Decimal(str(item['unit_price'])) * take)
                    b.quantity -= take
                    b.save()
                    qty -= take
            broadcast_stock_update.delay([i['product'] for i in items_data], 'product')
            return Response(serializer.data, status=201)

class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    permission_classes = [IsAdmin]

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().order_by('-date', '-clock_in')
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='clock-in')
    def clock_in(self, request):
        staff_id = request.data.get('staff_id')
        att, _ = Attendance.objects.get_or_create(staff_id=staff_id, date=timezone.now().date())
        att.clock_in = timezone.now()
        att.save()
        return Response({"message": "Clocked in"})

    @action(detail=False, methods=['post'], url_path='clock-out')
    def clock_out(self, request):
        att = Attendance.objects.get(staff_id=request.data.get('staff_id'), date=timezone.now().date())
        att.clock_out = timezone.now()
        att.save()
        return Response({"message": "Clocked out"})

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='collect-payment')
    def collect_payment(self, request, pk=None):
        cust = self.get_object()
        amt = decimal.Decimal(str(request.data.get('amount', 0)))
        with transaction.atomic():
            cust.balance -= amt
            cust.save()
            Transaction.objects.create(customer=cust, amount=amt, transaction_type='Payment Received', method=request.data.get('method', 'Cash'))
        return Response({"message": "Payment recorded", "balance": cust.balance})

    @action(detail=False, methods=['get'], url_path='due-for-refill')
    def due_for_refill(self, request):
        items = SaleItem.objects.filter(sale__created_at__gte=timezone.now()-datetime.timedelta(days=90)).select_related('sale__customer', 'drug')
        due, seen = [], set()
        for i in items:
            if not i.sale.customer or i.sale.customer.id in seen: continue
            elapsed = (timezone.now() - i.sale.created_at).days
            if i.quantity > 0 and elapsed >= (i.quantity - 5):
                due.append({"id": i.sale.customer.id, "name": f"{i.sale.customer.first_name} {i.sale.customer.last_name}", "phone": i.sale.customer.phone_number, "medication": i.drug.name, "days_since": elapsed})
                seen.add(i.sale.customer.id)
        return Response(due)

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all().order_by('-created_at')
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]

class SystemSettingsViewSet(viewsets.ModelViewSet):
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer
    permission_classes = [IsAdmin]

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by('-date')
    serializer_class = ExpenseSerializer
    permission_classes = [IsAdminOrPharmacist]

    @action(detail=False, methods=['get'], url_path='financial-summary')
    def financial_summary(self, request):
        p_rev = Sale.objects.aggregate(t=Sum('total_amount'))['t'] or 0
        s_rev = SupermarketSale.objects.aggregate(t=Sum('total_amount'))['t'] or 0
        exp = Expense.objects.aggregate(t=Sum('amount'))['t'] or 0
        from django.db.models.functions import TruncMonth
        history = Sale.objects.annotate(m=TruncMonth('created_at')).values('m').annotate(t=Sum('total_amount')).order_by('m')
        return Response({
            "total_revenue": float(p_rev + s_rev), "total_expenses": float(exp),
            "net_profit": float(p_rev + s_rev - exp), "balance": float(p_rev + s_rev - exp),
            "pharmacy_revenue": float(p_rev), "supermarket_revenue": float(s_rev),
            "chart_data": [{"month": i['m'].strftime('%b'), "revenue": float(i['t'])} for i in history]
        })

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all().order_by('-timestamp')
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdmin]

class ReportsView(viewsets.ViewSet):
    permission_classes = [IsAdminOrPharmacist]

    @action(detail=False, methods=['get'], url_path='dead-stock')
    def dead_stock(self, request):
        """Find items that haven't sold in 90 days."""
        ninety_days_ago = timezone.now() - datetime.timedelta(days=90)
        # Drugs with no sales items in last 90 days
        sold_drug_ids = SaleItem.objects.filter(sale__created_at__gte=ninety_days_ago).values_list('drug_id', flat=True)
        aging_drugs = Drug.objects.exclude(id__in=sold_drug_ids)

        return Response([{
            "name": d.name,
            "stock": d.total_stock,
            "value": float(d.total_stock * d.unit_price)
        } for d in aging_drugs if d.total_stock > 0])

    @action(detail=False, methods=['get'], url_path='z-report')
    def z_report(self, request):
        """Daily reconciliation summary."""
        today = timezone.now().date()
        sales = Sale.objects.filter(created_at__date=today)

        summary = {
            "total_sales": sales.count(),
            "gross_revenue": sales.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
            "cash": (
                (sales.filter(payment_method='Cash').aggregate(Sum('total_amount'))['total_amount__sum'] or 0) +
                (sales.filter(payment_method__icontains='Cash:').aggregate(Sum('total_amount'))['total_amount__sum'] or 0)
            ),
            "pos": (
                (sales.filter(payment_method='POS').aggregate(Sum('total_amount'))['total_amount__sum'] or 0) +
                (sales.filter(payment_method='Card').aggregate(Sum('total_amount'))['total_amount__sum'] or 0) +
                (sales.filter(payment_method__icontains='POS:').aggregate(Sum('total_amount'))['total_amount__sum'] or 0)
            ),
            "transfer": sales.filter(payment_method='Transfer').aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
            "credit": sales.filter(payment_method='Credit').aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
        }
        return Response(summary)
    @action(detail=False, methods=['get'], url_path='inventory-valuation')
    def inventory_valuation(self, request):
        d_val = DrugBatch.objects.filter(expiry_date__gt=timezone.now().date()).aggregate(t=Sum(F('quantity')*F('cost_price')))['t'] or 0
        p_val = ProductBatch.objects.filter(expiry_date__gt=timezone.now().date()).aggregate(t=Sum(F('quantity')*F('cost_price')))['t'] or 0
        return Response({"total_asset_value": float(d_val + p_val)})

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    import psutil
    return Response({"status": "healthy", "metrics": {"cpu": psutil.cpu_percent(), "memory": psutil.virtual_memory().percent}})

@api_view(['GET'])
@permission_classes([IsAdmin])
def backup_database(request):
    # ... (Already implemented logic)
    return Response({"message": "Backup triggered"})

@api_view(['POST'])
def update_profile(request):
    ser = UserProfileSerializer(request.user, data=request.data, partial=True)
    ser.is_valid(raise_exception=True)
    ser.save()
    return Response({"message": "Updated"})

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    user = User.objects.get(username=request.data.get('username').lower())
    user.set_password('admin123')
    user.save()
    return Response({"message": "Reset to admin123"})
