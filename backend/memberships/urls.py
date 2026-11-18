from django.urls import path
from . import views

urlpatterns = [
    path('membership-plans/', views.MembershipPlanListView.as_view(), name='plan-list'),
    path('membership-plans/<int:pk>/', views.MembershipPlanDetailView.as_view(), name='plan-detail'),
    path('memberships/', views.MembershipListView.as_view(), name='membership-list'),
    path('memberships/<int:pk>/', views.MembershipDetailView.as_view(), name='membership-detail'),
    path('memberships/<int:pk>/renew/', views.RenewMembershipView.as_view(), name='membership-renew'),
    path('memberships/expiring/', views.ExpiringMembershipsView.as_view(), name='membership-expiring'),
]
