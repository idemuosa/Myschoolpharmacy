import os
import django
from datetime import date

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Staff, Customer, Sale, SaleItem, SaleReturn, Prescription, PrescriptionItem, Drug, Product, SupermarketSale, SupermarketSaleItem, Expense

def reset_system():
    print("--- Pharmacy Data Reset Starting ---")
    
    # Ensure admin user exists
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("Created missing 'admin' user.")

    # Clear transaction and clinical records
    print("Clearing Sales, Returns, Prescriptions, Expenses, Supermarket Sales...")
    SaleReturn.objects.all().delete()
    SaleItem.objects.all().delete()
    Sale.objects.all().delete()
    PrescriptionItem.objects.all().delete()
    Prescription.objects.all().delete()
    SupermarketSaleItem.objects.all().delete()
    SupermarketSale.objects.all().delete()
    Expense.objects.all().delete()

    # Clear staff and customers except admin staff
    print("Clearing Staff (except Admin) and Patients/Customers...")
    # Keep staff members with admin role or corresponding to superusers
    admin_usernames = set(User.objects.filter(is_superuser=True).values_list('username', flat=True))
    
    non_admin_staff = Staff.objects.exclude(role__iexact='admin').exclude(employee_id__in=admin_usernames)
    non_admin_employee_ids = list(non_admin_staff.values_list('employee_id', flat=True))

    non_admin_staff.delete()
    Customer.objects.all().delete()
    
    # Delete non-superuser login accounts
    User.objects.filter(is_superuser=False).delete()

    # Reset stock for expired items
    print("Resetting stock for expired drugs...")
    today = date.today()
    expired_drugs = Drug.objects.filter(expiry_date__lt=today)
    expired_count = expired_drugs.count()
    expired_drugs.update(stock=0)
    
    print(f"Success: Reset {expired_count} expired drug stocks to 0.")
    print(f"Remaining Users: {User.objects.count()} (Superusers/Admins)")
    print(f"Remaining Staff: {Staff.objects.count()} (Admin Staff)")
    print(f"Remaining Customers: {Customer.objects.count()}")
    print("System reset complete.")
    print("-----------------------------------")

if __name__ == "__main__":
    reset_system()
