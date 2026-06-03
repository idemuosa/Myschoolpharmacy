from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50) # 'Pharmacy' or 'Supermarket'

    def __str__(self):
        return f"{self.name} ({self.type})"

class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=50, default='Active')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0) # What we owe them

    def __str__(self):
        return self.name

class Drug(models.Model):
    name = models.CharField(max_length=255)
    generic_name = models.CharField(max_length=255, blank=True, null=True)
    category_obj = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True)
    dosage = models.CharField(max_length=50)
    form = models.CharField(max_length=50)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reorder_level = models.IntegerField(default=10)
    barcode = models.CharField(max_length=100, blank=True, null=True, unique=True)

    @property
    def total_stock(self):
        return self.batches.filter(expiry_date__gt=timezone.now().date()).aggregate(total=models.Sum('quantity'))['total'] or 0

    def __str__(self):
        return f"{self.name} ({self.dosage})"

class DrugBatch(models.Model):
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE, related_name='batches')
    batch_number = models.CharField(max_length=100)
    quantity = models.IntegerField()
    expiry_date = models.DateField()
    manufacturing_date = models.DateField(null=True, blank=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['expiry_date']

class Product(models.Model):
    name = models.CharField(max_length=255)
    category_obj = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reorder_level = models.IntegerField(default=10)
    barcode = models.CharField(max_length=100, blank=True, null=True, unique=True)

    @property
    def total_stock(self):
        return self.batches.filter(expiry_date__gt=timezone.now().date()).aggregate(total=models.Sum('quantity'))['total'] or 0

class ProductBatch(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='batches')
    batch_number = models.CharField(max_length=100)
    quantity = models.IntegerField()
    expiry_date = models.DateField()
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class Staff(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=100, default='Cashier')
    department = models.CharField(max_length=100)
    employee_id = models.CharField(max_length=50, unique=True)
    photo = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='Active')

    def __str__(self):
        return self.full_name

class Customer(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    customer_id = models.CharField(max_length=50, unique=True)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    chronic_conditions = models.TextField(blank=True, null=True)
    medications = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='Active')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0) # What they owe us

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Sale(models.Model):
    transaction_id = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchases')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=50) # Cash, Card, Credit
    status = models.CharField(max_length=50, default='Paid') # Paid, Partial, Credit
    staff = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def amount_due(self):
        return self.total_amount - self.amount_paid

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    drug = models.ForeignKey(Drug, on_delete=models.SET_NULL, null=True)
    batch = models.ForeignKey(DrugBatch, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0) # Real profit tracking
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    @property
    def profit(self):
        return self.subtotal - (self.cost_price * self.quantity)

class StockAdjustment(models.Model):
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.IntegerField() # Negative for loss, Positive for found items
    reason = models.CharField(max_length=100, choices=[
        ('Damage', 'Damaged/Broken'),
        ('Expiry', 'Expired/Disposed'),
        ('Found', 'Found during count'),
        ('Transfer', 'Inter-branch Transfer'),
        ('Theft', 'Shrinkage/Theft')
    ])
    notes = models.TextField(blank=True, null=True)
    staff = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class Transaction(models.Model):
    # For tracking payments towards debts
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True, related_name='ledger')
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, null=True, blank=True, related_name='ledger')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=50) # 'Payment Received', 'Payment Sent'
    method = models.CharField(max_length=50)
    notes = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class PurchaseOrder(models.Model):
    order_id = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, default='Draft')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    received_at = models.DateTimeField(null=True, blank=True)

class PurchaseOrderItem(models.Model):
    order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    drug = models.ForeignKey(Drug, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.IntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

# ... (Include other existing models like Attendance, SystemSettings, ActivityLog, etc.)
class Attendance(models.Model):
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField(default=timezone.now)
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default='Present')

class Prescription(models.Model):
    prescription_id = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, related_name='prescriptions')
    prescribing_doctor = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

class PrescriptionItem(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='items')
    drug = models.ForeignKey(Drug, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField()
    directions = models.TextField()

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    module = models.CharField(max_length=100)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class InventoryAudit(models.Model):
    audit_id = models.CharField(max_length=50, unique=True)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=[('In Progress', 'In Progress'), ('Completed', 'Completed')], default='In Progress')
    notes = models.TextField(blank=True, null=True)

class InventoryAuditItem(models.Model):
    audit = models.ForeignKey(InventoryAudit, on_delete=models.CASCADE, related_name='items')
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    expected_quantity = models.IntegerField()
    counted_quantity = models.IntegerField()
    discrepancy = models.IntegerField()
