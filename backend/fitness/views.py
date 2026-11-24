from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import FitnessProgress
from .serializers import FitnessProgressSerializer
from users.models import TrainerProfile
from users.views import IsAdminOrTrainer


class FitnessProgressListView(generics.ListCreateAPIView):
    serializer_class = FitnessProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = FitnessProgress.objects.select_related('member').all()
        
        if user.role == 'member':
            qs = qs.filter(member=user)
        elif user.role == 'trainer':
            try:
                trainer_profile = user.trainer_profile
                qs = qs.filter(member__in=trainer_profile.assigned_members.all())
            except TrainerProfile.DoesNotExist:
                return FitnessProgress.objects.none()

        member_id = self.request.query_params.get('member_id')
        if member_id:
            if user.role == 'member':
                qs = qs.filter(member=user)
            else:
                qs = qs.filter(member_id=member_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'member':
            raise PermissionDenied("Members cannot record fitness progress.")
        elif user.role == 'trainer':
            try:
                trainer_profile = user.trainer_profile
                target_member = serializer.validated_data.get('member')
                if not trainer_profile.assigned_members.filter(id=target_member.id).exists():
                    raise PermissionDenied("You can only log fitness progress for members assigned to you.")
            except TrainerProfile.DoesNotExist:
                raise PermissionDenied("Trainer profile not found.")
        serializer.save(recorded_by=user)


class FitnessProgressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FitnessProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = FitnessProgress.objects.all()
        if user.role == 'member':
            return qs.filter(member=user)
        elif user.role == 'trainer':
            try:
                trainer_profile = user.trainer_profile
                return qs.filter(member__in=trainer_profile.assigned_members.all())
            except TrainerProfile.DoesNotExist:
                return FitnessProgress.objects.none()
        return qs

    def perform_update(self, serializer):
        user = self.request.user
        if user.role == 'member':
            raise PermissionDenied("Members cannot update fitness progress.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role == 'member':
            raise PermissionDenied("Members cannot delete fitness progress.")
        instance.delete()

