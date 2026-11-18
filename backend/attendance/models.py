from django.db import models
from datetime import date


class Attendance(models.Model):
    member = models.ForeignKey(
        'users.User', on_delete=models.CASCADE, related_name='attendance_records'
    )
    date = models.DateField(default=date.today)
    check_in_time = models.DateTimeField(auto_now_add=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    marked_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='marked_attendance'
    )

    class Meta:
        unique_together = ['member', 'date']
        ordering = ['-date', '-check_in_time']

    def __str__(self):
        return f"{self.member} - {self.date}"
