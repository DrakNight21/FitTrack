from django.contrib import admin
from .models import WorkoutPlan, WorkoutDay, Exercise


@admin.register(WorkoutPlan)
class WorkoutPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'trainer', 'is_active', 'created_at']
    filter_horizontal = ['assigned_members']


@admin.register(WorkoutDay)
class WorkoutDayAdmin(admin.ModelAdmin):
    list_display = ['plan', 'day']


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['name', 'workout_day', 'sets', 'reps', 'rest_seconds']
