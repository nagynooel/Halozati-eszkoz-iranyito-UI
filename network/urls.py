from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view),
    path('connect/<str:ip_address>/', views.connect)
]
