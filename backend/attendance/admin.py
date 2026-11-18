from django.contrib import admin
from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['member', 'date', 'check_in_time']
    list_filter = ['date']
    search_fields = ['member__email', 'member__first_name']
