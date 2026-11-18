from django.db import models
from datetime import date


class Payment(models.Model):
    STATUS_CHOICES = [
        ('paid', 'Paid'), ('pending', 'Pending'),
        ('failed', 'Failed'), ('refunded', 'Refunded'),
    ]
    METHOD_CHOICES = [
        ('cash', 'Cash'), ('card', 'Card'),
        ('upi', 'UPI'), ('bank_transfer', 'Bank Transfer'),
    ]
    member = models.ForeignKey(
        'users.User', on_delete=models.CASCADE, related_name='payments'
    )
    membership = models.ForeignKey(
        'memberships.Membership', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(default=date.today)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='cash')
    transaction_id = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.member} - ₹{self.amount} ({self.status})"
