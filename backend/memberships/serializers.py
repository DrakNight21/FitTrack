from rest_framework import serializers
from .models import MembershipPlan, Membership
from users.serializers import UserSerializer


class MembershipPlanSerializer(serializers.ModelSerializer):
    duration_label = serializers.ReadOnlyField()

    class Meta:
        model = MembershipPlan
        fields = '__all__'


class MembershipSerializer(serializers.ModelSerializer):
    member_detail = UserSerializer(source='member', read_only=True)
    plan_detail = MembershipPlanSerializer(source='plan', read_only=True)
    is_expired = serializers.ReadOnlyField()
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Membership
        fields = '__all__'

    def get_days_remaining(self, obj):
        from django.utils import timezone
        delta = obj.end_date - timezone.now().date()
        return delta.days
