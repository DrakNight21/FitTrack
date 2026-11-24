from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from .models import User, TrainerProfile
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    ProfileUpdateSerializer, UserCreateSerializer, TrainerProfileSerializer
)


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsAdminOrTrainer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'trainer']


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'Registration successful.'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully.'})


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class UserListView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAdminOrTrainer()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        qs = User.objects.all().order_by('-created_at')
        if self.request.user.role == 'trainer':
            qs = qs.filter(role='member')
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        is_active = self.request.query_params.get('is_active')
        if role:
            qs = qs.filter(role=role)
        if search:
            qs = qs.filter(
                first_name__icontains=search
            ) | qs.filter(
                last_name__icontains=search
            ) | qs.filter(
                email__icontains=search
            )
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        return qs

    def create(self, request, *args, **kwargs):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = User.objects.all()

    def get_serializer_class(self):
        return UserSerializer

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        instance = self.get_object()
        serializer = UserSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.id == request.user.id:
            return Response({'error': 'You cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        user_name = instance.get_full_name() or instance.username
        instance.delete()
        return Response({'message': f'{user_name} deleted successfully.'}, status=status.HTTP_200_OK)


class TrainerListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = User.objects.filter(role='trainer').order_by('-created_at')
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        return qs


class TrainerProfileUpdateView(generics.UpdateAPIView):
    serializer_class = TrainerProfileSerializer
    permission_classes = [IsAdmin]

    def get_object(self):
        trainer_id = self.kwargs['pk']
        trainer = User.objects.get(pk=trainer_id, role='trainer')
        profile, _ = TrainerProfile.objects.get_or_create(trainer=trainer)
        return profile


class AssignMemberToTrainerView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, trainer_id):
        member_id = request.data.get('member_id')
        action = request.data.get('action', 'assign')
        try:
            trainer = User.objects.get(pk=trainer_id, role='trainer')
            member = User.objects.get(pk=member_id, role='member')
            profile, _ = TrainerProfile.objects.get_or_create(trainer=trainer)
            if action == 'assign':
                # Remove member from any previous trainer profiles so assignment is clean
                for prev_tp in member.assigned_trainers.all():
                    if prev_tp.id != profile.id:
                        prev_tp.assigned_members.remove(member)
                profile.assigned_members.add(member)
                return Response({
                    'message': f'{member.get_full_name() or member.username} assigned to {trainer.get_full_name() or trainer.username}',
                    'trainer_id': trainer.id,
                    'member_id': member.id,
                    'action': 'assign'
                })
            else:
                profile.assigned_members.remove(member)
                return Response({
                    'message': f'{member.get_full_name() or member.username} unassigned from {trainer.get_full_name() or trainer.username}',
                    'trainer_id': trainer.id,
                    'member_id': member.id,
                    'action': 'unassign'
                })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


class MyMembersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'trainer':
            try:
                profile = user.trainer_profile
                return profile.assigned_members.all()
            except TrainerProfile.DoesNotExist:
                return User.objects.none()
        return User.objects.none()
