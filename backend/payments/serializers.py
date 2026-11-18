from rest_framework import serializers
from .models import Payment
from users.serializers import UserSerializer


class PaymentSerializer(serializers.ModelSerializer):
    member_detail = UserSerializer(source='member', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
