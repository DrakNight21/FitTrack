from rest_framework import serializers
from .models import WorkoutPlan, WorkoutDay, Exercise


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'


class WorkoutDaySerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutDay
        fields = '__all__'


class WorkoutPlanSerializer(serializers.ModelSerializer):
    days = WorkoutDaySerializer(many=True, read_only=True)
    trainer_name = serializers.SerializerMethodField()
    assigned_member_count = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPlan
        fields = '__all__'

    def get_trainer_name(self, obj):
        if obj.trainer:
            return obj.trainer.get_full_name() or obj.trainer.username
        return None

    def get_assigned_member_count(self, obj):
        return obj.assigned_members.count()
