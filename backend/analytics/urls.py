from django.urls import path
from . import views

urlpatterns = [
    path('analytics/dashboard/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
]
