from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import date
from .models import Attendance
from .serializers import AttendanceSerializer
from users.views import IsAdmin, IsAdminOrTrainer


class AttendanceListView(generics.ListCreateAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Attendance.objects.select_related('member', 'marked_by').all()
        if user.role == 'member':
            qs = qs.filter(member=user)
        member_id = self.request.query_params.get('member_id')
        date_filter = self.request.query_params.get('date')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if member_id and user.role in ['admin', 'trainer']:
            qs = qs.filter(member_id=member_id)
        if date_filter:
            qs = qs.filter(date=date_filter)
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs

    def create(self, request, *args, **kwargs):
        member_id = request.data.get('member')
        att_date = request.data.get('date', str(date.today()))
        if Attendance.objects.filter(member_id=member_id, date=att_date).exists():
            return Response({'error': 'Attendance already marked for this member today.'}, status=400)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(marked_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AttendanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAdminOrTrainer]
    queryset = Attendance.objects.all()


class DailyAttendanceStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = date.today()
        count = Attendance.objects.filter(date=today).count()
        return Response({'date': str(today), 'count': count})
