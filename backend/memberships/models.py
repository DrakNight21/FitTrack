from django.db import models
from django.utils import timezone


class MembershipPlan(models.Model):
    name = models.CharField(max_length=100)
    duration_months = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    features = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.duration_months}mo)"

    @property
    def duration_label(self):
        m = self.duration_months
        if m == 1: return 'Monthly'
        if m == 3: return 'Quarterly'
        if m == 6: return 'Half-Yearly'
        if m == 12: return 'Yearly'
        return f'{m} Months'


class Membership(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
        ('pending', 'Pending'),
    ]
    member = models.ForeignKey(
        'users.User', on_delete=models.CASCADE, related_name='memberships'
    )
    plan = models.ForeignKey(
        MembershipPlan, on_delete=models.SET_NULL, null=True, related_name='memberships'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.member} - {self.plan} ({self.status})"

    @property
    def is_expired(self):
        return self.end_date < timezone.now().date()

    def save(self, *args, **kwargs):
        if self.end_date and self.end_date < timezone.now().date():
            self.status = 'expired'
        super().save(*args, **kwargs)
