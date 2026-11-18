from rest_framework import serializers
from .models import Attendance
from users.serializers import UserSerializer


class AttendanceSerializer(serializers.ModelSerializer):
    member_detail = UserSerializer(source='member', read_only=True)
    marked_by_detail = UserSerializer(source='marked_by', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['check_in_time', 'marked_by']
