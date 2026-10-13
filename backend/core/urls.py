"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from api.views import health_check, CustomTokenObtainPairView, SystemSettingsViewSet, custom_500_handler

handler500 = custom_500_handler

settings_list = SystemSettingsViewSet.as_view({'get': 'list', 'post': 'create'})

urlpatterns = [
    path('', health_check, name='root_health'),
    path('health/', health_check, name='health_check'),
    path('health-check/', health_check, name='health_check_alias'),
    path('login/', CustomTokenObtainPairView.as_view(), name='root_login_alias'),
    path('token/', CustomTokenObtainPairView.as_view(), name='root_token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='root_token_refresh'),
    path('settings/', settings_list, name='root_settings'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/login/', CustomTokenObtainPairView.as_view(), name='login_alias'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include('api.urls')),
]
