from django.urls import path
from . import views

urlpatterns = [
    path('attendance/', views.AttendanceListView.as_view(), name='attendance-list'),
    path('attendance/<int:pk>/', views.AttendanceDetailView.as_view(), name='attendance-detail'),
    path('attendance/daily-stats/', views.DailyAttendanceStatsView.as_view(), name='attendance-stats'),
]
