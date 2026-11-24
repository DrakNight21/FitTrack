from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from datetime import date
from .models import MembershipPlan, Membership
from .serializers import MembershipPlanSerializer, MembershipSerializer
from users.views import IsAdmin


class MembershipPlanListView(generics.ListCreateAPIView):
    serializer_class = MembershipPlanSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    def get_queryset(self):
        return MembershipPlan.objects.filter(is_active=True).order_by('price')


class MembershipPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MembershipPlanSerializer
    permission_classes = [IsAdmin]
    queryset = MembershipPlan.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        plan_name = instance.name
        instance.delete()
        return Response({'message': f'Pricing plan "{plan_name}" deleted successfully.'}, status=status.HTTP_200_OK)


class MembershipListView(generics.ListCreateAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Membership.objects.select_related('member', 'plan').all()
        if user.role == 'member':
            qs = qs.filter(member=user)
        status_f = self.request.query_params.get('status')
        member_id = self.request.query_params.get('member_id')
        if status_f:
            qs = qs.filter(status=status_f)
        if member_id and user.role == 'admin':
            qs = qs.filter(member_id=member_id)
        return qs.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied.'}, status=403)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MembershipDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [IsAdmin]
    queryset = Membership.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        member_name = instance.member.get_full_name() or instance.member.username
        plan_name = instance.plan.name if instance.plan else 'Custom Plan'
        instance.delete()
        return Response(
            {'message': f'Subscription of {member_name} ({plan_name}) deleted successfully.'},
            status=status.HTTP_200_OK
        )


class RenewMembershipView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            membership = Membership.objects.get(pk=pk)
            plan = membership.plan
            new_start = date.today()
            new_end = new_start + relativedelta(months=plan.duration_months)
            membership.start_date = new_start
            membership.end_date = new_end
            membership.status = 'active'
            membership.save()
            return Response(MembershipSerializer(membership).data)
        except Membership.DoesNotExist:
            return Response({'error': 'Membership not found.'}, status=404)


class ExpiringMembershipsView(generics.ListAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        in_7_days = date.today() + timezone.timedelta(days=7)
        return Membership.objects.filter(
            status='active',
            end_date__lte=in_7_days,
            end_date__gte=date.today()
        ).order_by('end_date')
