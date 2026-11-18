from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['member', 'amount', 'payment_date', 'status', 'payment_method']
    list_filter = ['status', 'payment_method']
    search_fields = ['member__email', 'member__first_name', 'transaction_id']
