from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.ProfileView.as_view(), name='profile'),
    # Users (admin)
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    # Trainers
    path('trainers/', views.TrainerListView.as_view(), name='trainer-list'),
    path('trainers/<int:pk>/profile/', views.TrainerProfileUpdateView.as_view(), name='trainer-profile'),
    path('trainers/<int:trainer_id>/assign-member/', views.AssignMemberToTrainerView.as_view(), name='assign-member'),
    path('users/my-members/', views.MyMembersView.as_view(), name='my-members'),
]
