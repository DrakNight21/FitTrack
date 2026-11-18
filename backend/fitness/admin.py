from django.contrib import admin
from .models import FitnessProgress


@admin.register(FitnessProgress)
class FitnessProgressAdmin(admin.ModelAdmin):
    list_display = ['member', 'date', 'weight_kg', 'height_cm', 'body_fat_percentage']
    list_filter = ['date']
    search_fields = ['member__email', 'member__first_name']
