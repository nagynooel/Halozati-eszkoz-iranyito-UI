from django.contrib import admin
from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

# Add this import at the top of your urls.py
from .views import test_connection

# Add this new URL pattern in the urlpatterns list
urlpatterns = [
    path('', views.index_view, name="index"),
    path('connect/', views.connect, name="connect"),
    path('send_command/', views.send_command, name="send_command"),
    path('test_connection/', test_connection, name="test_connection"),  # New URL pattern
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)