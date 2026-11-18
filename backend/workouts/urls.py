from django.urls import path
from . import views

urlpatterns = [
    path('workouts/', views.WorkoutPlanListView.as_view(), name='workout-list'),
    path('workouts/<int:pk>/', views.WorkoutPlanDetailView.as_view(), name='workout-detail'),
    path('workouts/<int:pk>/assign/', views.AssignWorkoutView.as_view(), name='workout-assign'),
    path('workouts/<int:plan_id>/days/', views.WorkoutDayListView.as_view(), name='workout-days'),
    path('workout-days/<int:pk>/', views.WorkoutDayDetailView.as_view(), name='workout-day-detail'),
    path('workout-days/<int:day_id>/exercises/', views.ExerciseListView.as_view(), name='exercise-list'),
    path('exercises/<int:pk>/', views.ExerciseDetailView.as_view(), name='exercise-detail'),
]
