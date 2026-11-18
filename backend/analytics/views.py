from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth, TruncDate
from django.utils import timezone
from datetime import date, timedelta
from users.models import User
from users.views import IsAdmin


class DashboardStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from memberships.models import Membership
        from attendance.models import Attendance
        from payments.models import Payment

        today = date.today()
        current_month = today.month
        current_year = today.year

        # Core stats
        total_members = User.objects.filter(role='member').count()
        total_trainers = User.objects.filter(role='trainer').count()
        active_memberships = Membership.objects.filter(status='active').count()
        active_members = Membership.objects.filter(status='active').values('member').distinct().count()
        today_attendance = Attendance.objects.filter(date=today).count()
        monthly_revenue = Payment.objects.filter(
            status='paid',
            payment_date__month=current_month,
            payment_date__year=current_year
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Revenue last 6 months
        revenue_chart = []
        for i in range(5, -1, -1):
            d = today.replace(day=1) - timedelta(days=i * 28)
            rev = Payment.objects.filter(
                status='paid',
                payment_date__year=d.year,
                payment_date__month=d.month
            ).aggregate(total=Sum('amount'))['total'] or 0
            revenue_chart.append({
                'month': d.strftime('%b %Y'),
                'revenue': float(rev)
            })

        # Membership growth last 6 months
        membership_growth = []
        for i in range(5, -1, -1):
            d = today.replace(day=1) - timedelta(days=i * 28)
            count = User.objects.filter(
                role='member',
                date_joined__year=d.year,
                date_joined__month=d.month
            ).count()
            membership_growth.append({
                'month': d.strftime('%b %Y'),
                'members': count
            })

        # Attendance last 7 days
        attendance_chart = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            count = Attendance.objects.filter(date=d).count()
            attendance_chart.append({
                'date': d.strftime('%a'),
                'count': count
            })

        # Recent members (last 5)
        recent_members = []
        for u in User.objects.filter(role='member').order_by('-date_joined')[:5]:
            recent_members.append({
                'id': u.id,
                'name': u.get_full_name() or u.username,
                'email': u.email,
                'joined': u.date_joined.strftime('%Y-%m-%d')
            })

        # Recent payments (last 5)
        recent_payments = []
        for p in Payment.objects.select_related('member').order_by('-created_at')[:5]:
            recent_payments.append({
                'id': p.id,
                'member': p.member.get_full_name() or p.member.username,
                'amount': float(p.amount),
                'status': p.status,
                'date': str(p.payment_date),
                'method': p.payment_method
            })

        # Expiring memberships (next 7 days)
        expiring = []
        in_7 = today + timedelta(days=7)
        for m in Membership.objects.filter(
            status='active', end_date__lte=in_7, end_date__gte=today
        ).select_related('member', 'plan').order_by('end_date')[:5]:
            expiring.append({
                'id': m.id,
                'member': m.member.get_full_name() or m.member.username,
                'plan': m.plan.name if m.plan else 'N/A',
                'end_date': str(m.end_date),
                'days_left': (m.end_date - today).days
            })

        return Response({
            'total_members': total_members,
            'active_members': active_members,
            'total_trainers': total_trainers,
            'active_memberships': active_memberships,
            'today_attendance': today_attendance,
            'monthly_revenue': float(monthly_revenue),
            'revenue_chart': revenue_chart,
            'membership_growth': membership_growth,
            'attendance_chart': attendance_chart,
            'recent_members': recent_members,
            'recent_payments': recent_payments,
            'expiring_memberships': expiring,
        })
