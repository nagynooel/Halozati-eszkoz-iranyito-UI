from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view, name="index"),
    path('connect/<str:ip_address>/', views.connect, name="connect"),
    path('send_command/', views.send_command, name="send_command")
]
