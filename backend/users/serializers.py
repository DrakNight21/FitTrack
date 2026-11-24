from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, TrainerProfile


class TrainerProfileSerializer(serializers.ModelSerializer):
    assigned_members = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = TrainerProfile
        fields = ['specializations', 'bio', 'experience_years', 'assigned_members']


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    trainer_profile = TrainerProfileSerializer(read_only=True)
    assigned_trainer = serializers.SerializerMethodField()
    date_of_birth = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'profile_picture', 'date_of_birth', 'address',
            'emergency_contact', 'is_active', 'created_at', 'updated_at',
            'trainer_profile', 'assigned_trainer'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if data.get('date_of_birth') == '':
                data['date_of_birth'] = None
        return super().to_internal_value(data)

    def validate_email(self, value):
        if value:
            existing = User.objects.filter(email=value).exclude(pk=self.instance.pk if self.instance else None)
            if existing.exists():
                raise serializers.ValidationError("This email is already in use by another account.")
        return value

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_assigned_trainer(self, obj):
        if obj.role == 'member':
            trainer_profiles = obj.assigned_trainers.all()
            if trainer_profiles.exists():
                tp = trainer_profiles.last()
                return {
                    'id': tp.trainer.id,
                    'name': tp.trainer.get_full_name() or tp.trainer.username,
                    'specializations': tp.specializations
                }
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'password', 'confirm_password', 'role']

    def validate_role(self, value):
        if value == 'admin':
            raise serializers.ValidationError("Cannot register as admin.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        email = validated_data['email']
        username = email.split('@')[0]
        base = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{counter}"
            counter += 1
        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            role=validated_data.get('role', 'member'),
        )
        if user.role == 'trainer':
            TrainerProfile.objects.create(trainer=user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")
        user = authenticate(username=user_obj.username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("Account is deactivated.")
        data['user'] = user
        return data


class ProfileUpdateSerializer(serializers.ModelSerializer):
    date_of_birth = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'date_of_birth', 'address', 'emergency_contact', 'profile_picture']

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if data.get('date_of_birth') == '':
                data['date_of_birth'] = None
        return super().to_internal_value(data)


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, default='fittrack123')
    date_of_birth = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'role', 'password', 'date_of_birth', 'address', 'is_active']

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if data.get('date_of_birth') == '':
                data['date_of_birth'] = None
        return super().to_internal_value(data)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', 'fittrack123')
        email = validated_data['email']
        username = email.split('@')[0]
        base = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{counter}"
            counter += 1
        user = User.objects.create_user(username=username, password=password, **validated_data)
        if user.role == 'trainer':
            TrainerProfile.objects.get_or_create(trainer=user)
        return user
