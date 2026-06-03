from rest_framework import permissions

class IsAdminOrPharmacist(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        try:
            # First check if user is a Django superuser
            if request.user.is_superuser:
                return True

            # Then check staff profile
            from .models import Staff
            staff = Staff.objects.get(phone_number=request.user.username)
            return staff.role in ['Admin', 'Pharmacist', 'Manager']
        except Exception:
            return False

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        try:
            if request.user.is_superuser:
                return True
            from .models import Staff
            staff = Staff.objects.get(phone_number=request.user.username)
            return staff.role == 'Admin'
        except Exception:
            return False

class IsCashier(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return True # All authenticated users (Cashier, Pharmacist, Admin) can perform cashier tasks
