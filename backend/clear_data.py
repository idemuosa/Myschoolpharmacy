import os
import django
from datetime import date

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Staff, Customer, Sale, SaleItem, Prescription, PrescriptionItem, Drug

def reset_system():
    print("--- Pharmacy Data Reset Starting ---")
    
    # Clear transaction and clinical records
    print("Clearing Sales and Prescriptions...")
    SaleItem.objects.all().delete()
    Sale.objects.all().delete()
    PrescriptionItem.objects.all().delete()
    Prescription.objects.all().delete()
    
    # Clear staff and customers
    print("Clearing Staff and Customers...")
    Staff.objects.all().delete()
    Customer.objects.all().delete()
    
    # Reset stock for expired items
    print("Resetting stock for expired drugs...")
    today = date.today()
    expired_drugs = Drug.objects.filter(expiry_date__lt=today)
    expired_count = expired_drugs.count()
    expired_drugs.update(stock=0)
    
    print(f"Success: Reset {expired_count} expired drug stocks to 0.")
    print("System reset complete.")
    print("-----------------------------------")

if __name__ == "__main__":
    reset_system()
