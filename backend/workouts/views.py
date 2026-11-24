from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import WorkoutPlan, WorkoutDay, Exercise
from .serializers import WorkoutPlanSerializer, WorkoutDaySerializer, ExerciseSerializer
from users.views import IsAdmin, IsAdminOrTrainer
from users.models import User


class WorkoutPlanListView(generics.ListCreateAPIView):
    serializer_class = WorkoutPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = WorkoutPlan.objects.filter(is_active=True)
        if user.role == 'member':
            qs = qs.filter(assigned_members=user)
        elif user.role == 'trainer':
            qs = qs.filter(trainer=user)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        if self.request.user.role == 'trainer':
            serializer.save(trainer=self.request.user)
        else:
            serializer.save()

    def create(self, request, *args, **kwargs):
        if request.user.role not in ['admin', 'trainer']:
            return Response({'error': 'Permission denied.'}, status=403)
        return super().create(request, *args, **kwargs)


class WorkoutPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkoutPlanSerializer
    permission_classes = [IsAdminOrTrainer]
    queryset = WorkoutPlan.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role == 'trainer' and instance.trainer != request.user:
            return Response(
                {'error': 'You can only delete workout plans assigned to you.'},
                status=status.HTTP_403_FORBIDDEN
            )
        plan_name = instance.name
        instance.delete()
        return Response({'message': f'Workout plan "{plan_name}" deleted successfully.'}, status=status.HTTP_200_OK)


class WorkoutDayListView(generics.ListCreateAPIView):
    serializer_class = WorkoutDaySerializer
    permission_classes = [IsAdminOrTrainer]

    def get_queryset(self):
        return WorkoutDay.objects.filter(plan_id=self.kwargs['plan_id'])


class WorkoutDayDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkoutDaySerializer
    permission_classes = [IsAdminOrTrainer]
    queryset = WorkoutDay.objects.all()


class ExerciseListView(generics.ListCreateAPIView):
    serializer_class = ExerciseSerializer
    permission_classes = [IsAdminOrTrainer]

    def get_queryset(self):
        return Exercise.objects.filter(workout_day_id=self.kwargs['day_id'])


class ExerciseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExerciseSerializer
    permission_classes = [IsAdminOrTrainer]
    queryset = Exercise.objects.all()


class AssignWorkoutView(APIView):
    permission_classes = [IsAdminOrTrainer]

    def post(self, request, pk):
        member_id = request.data.get('member_id')
        action = request.data.get('action', 'assign')
        try:
            plan = WorkoutPlan.objects.get(pk=pk)
            member = User.objects.get(pk=member_id, role='member')

            # If user is a trainer, verify ownership of plan and member assignment
            if request.user.role == 'trainer':
                if plan.trainer != request.user:
                    return Response(
                        {'error': 'You can only assign workout plans you coach.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                trainer_profile = getattr(request.user, 'trainer_profile', None)
                if not trainer_profile or not trainer_profile.assigned_members.filter(id=member.id).exists():
                    return Response(
                        {'error': f'{member.get_full_name() or member.username} is not assigned to your coaching roster.'},
                        status=status.HTTP_403_FORBIDDEN
                    )

            if action == 'assign':
                plan.assigned_members.add(member)
                msg = f'Workout plan assigned to {member.get_full_name() or member.username}'
            else:
                plan.assigned_members.remove(member)
                msg = f'Workout plan unassigned from {member.get_full_name() or member.username}'

            return Response({
                'message': msg,
                'plan_id': plan.id,
                'member_id': member.id,
                'action': action,
                'assigned_members': list(plan.assigned_members.values_list('id', flat=True))
            })
        except (WorkoutPlan.DoesNotExist, User.DoesNotExist):
            return Response({'error': 'Not found.'}, status=404)
