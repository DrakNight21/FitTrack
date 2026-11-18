from rest_framework import serializers
from .models import FitnessProgress
from users.serializers import UserSerializer


class FitnessProgressSerializer(serializers.ModelSerializer):
    member_detail = UserSerializer(source='member', read_only=True)

    class Meta:
        model = FitnessProgress
        fields = '__all__'
        read_only_fields = ['recorded_by', 'created_at']
