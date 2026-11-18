from django.urls import path
from . import views

urlpatterns = [
    path('fitness/', views.FitnessProgressListView.as_view(), name='fitness-list'),
    path('fitness/<int:pk>/', views.FitnessProgressDetailView.as_view(), name='fitness-detail'),
]
