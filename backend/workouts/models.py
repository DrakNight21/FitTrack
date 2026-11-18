from django.db import models


class WorkoutPlan(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    trainer = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_workouts', limit_choices_to={'role': 'trainer'}
    )
    assigned_members = models.ManyToManyField(
        'users.User', related_name='workout_plans', blank=True,
        limit_choices_to={'role': 'member'}
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class WorkoutDay(models.Model):
    DAY_CHOICES = [
        ('Monday', 'Monday'), ('Tuesday', 'Tuesday'), ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'), ('Friday', 'Friday'), ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ]
    plan = models.ForeignKey(WorkoutPlan, on_delete=models.CASCADE, related_name='days')
    day = models.CharField(max_length=20, choices=DAY_CHOICES)

    class Meta:
        unique_together = ['plan', 'day']
        ordering = ['id']

    def __str__(self):
        return f"{self.plan.name} - {self.day}"


class Exercise(models.Model):
    workout_day = models.ForeignKey(WorkoutDay, on_delete=models.CASCADE, related_name='exercises')
    name = models.CharField(max_length=200)
    sets = models.IntegerField(default=3)
    reps = models.IntegerField(default=10)
    rest_seconds = models.IntegerField(default=60)
    notes = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.name} ({self.sets}x{self.reps})"
