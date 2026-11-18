from rest_framework import generics, permissions
from .models import FitnessProgress
from .serializers import FitnessProgressSerializer
from users.views import IsAdminOrTrainer


class FitnessProgressListView(generics.ListCreateAPIView):
    serializer_class = FitnessProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = FitnessProgress.objects.select_related('member').all()
        if user.role == 'member':
            qs = qs.filter(member=user)
        member_id = self.request.query_params.get('member_id')
        if member_id and user.role in ['admin', 'trainer']:
            qs = qs.filter(member_id=member_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class FitnessProgressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FitnessProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = FitnessProgress.objects.all()
