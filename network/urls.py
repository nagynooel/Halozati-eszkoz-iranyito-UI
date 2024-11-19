from django.contrib import admin
from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.index_view, name="index"),
    path('connect/<str:ip_address>/', views.connect, name="connect"),
    path('send_command/', views.send_command, name="send_command")
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)