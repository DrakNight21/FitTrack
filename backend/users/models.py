from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
        ('member', 'Member'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    phone = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"


class TrainerProfile(models.Model):
    trainer = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='trainer_profile',
        limit_choices_to={'role': 'trainer'}
    )
    specializations = models.CharField(max_length=500, blank=True)
    bio = models.TextField(blank=True)
    experience_years = models.IntegerField(default=0)
    assigned_members = models.ManyToManyField(
        User, related_name='assigned_trainers', blank=True,
        limit_choices_to={'role': 'member'}
    )

    def __str__(self):
        return f"Trainer Profile: {self.trainer.get_full_name()}"
