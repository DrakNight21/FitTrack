from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from .models import Payment
from .serializers import PaymentSerializer
from users.views import IsAdmin


class PaymentListView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Payment.objects.select_related('member').all()
        if user.role == 'member':
            qs = qs.filter(member=user)
        status_f = self.request.query_params.get('status')
        member_id = self.request.query_params.get('member_id')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        search = self.request.query_params.get('search')
        if status_f:
            qs = qs.filter(status=status_f)
        if member_id and user.role == 'admin':
            qs = qs.filter(member_id=member_id)
        if date_from:
            qs = qs.filter(payment_date__gte=date_from)
        if date_to:
            qs = qs.filter(payment_date__lte=date_to)
        if search and user.role == 'admin':
            qs = qs.filter(member__first_name__icontains=search) | qs.filter(member__last_name__icontains=search)
        return qs

    def create(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied.'}, status=403)
        return super().create(request, *args, **kwargs)


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAdmin]
    queryset = Payment.objects.all()


class PaymentSummaryView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        total_paid = Payment.objects.filter(status='paid').aggregate(t=Sum('amount'))['t'] or 0
        total_pending = Payment.objects.filter(status='pending').aggregate(t=Sum('amount'))['t'] or 0
        return Response({'total_paid': total_paid, 'total_pending': total_pending})
