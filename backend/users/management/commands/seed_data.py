from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
import random


class Command(BaseCommand):
    help = 'Seed sample data for FitTrack'

    def handle(self, *args, **kwargs):
        from users.models import User, TrainerProfile
        from memberships.models import MembershipPlan, Membership
        from attendance.models import Attendance
        from payments.models import Payment
        from workouts.models import WorkoutPlan, WorkoutDay, Exercise
        from fitness.models import FitnessProgress

        self.stdout.write('Seeding data...')

        # Admin
        if not User.objects.filter(email='admin@fittrack.com').exists():
            admin = User.objects.create_superuser(
                username='admin', email='admin@fittrack.com',
                password='admin123', first_name='Super', last_name='Admin',
                role='admin'
            )
            self.stdout.write(f'Created admin: {admin.email}')

        # Trainers
        trainers = []
        trainer_data = [
            ('Alex', 'Johnson', 'alex@fittrack.com', 'Strength Training, Powerlifting', 5),
            ('Sarah', 'Williams', 'sarah@fittrack.com', 'Yoga, Flexibility, Cardio', 3),
        ]
        for fn, ln, email, specs, exp in trainer_data:
            if not User.objects.filter(email=email).exists():
                t = User.objects.create_user(
                    username=email.split('@')[0], email=email,
                    password='trainer123', first_name=fn, last_name=ln, role='trainer'
                )
                profile, _ = TrainerProfile.objects.get_or_create(trainer=t)
                profile.specializations = specs
                profile.experience_years = exp
                profile.bio = f'Experienced fitness trainer specializing in {specs}'
                profile.save()
                self.stdout.write(f'Created trainer: {email}')
                trainers.append(t)
            else:
                trainers.append(User.objects.get(email=email))

        # Membership plans
        plans_data = [
            ('Basic', 1, 999, 'Gym Access\nLocker Room\nBasic Equipment'),
            ('Standard', 3, 2499, 'Gym Access\nLocker Room\nAll Equipment\nGroup Classes'),
            ('Premium', 6, 4499, 'Gym Access\nLocker Room\nAll Equipment\nGroup Classes\nPersonal Trainer (2/month)\nNutrition Consultation'),
            ('Elite', 12, 7999, 'Unlimited Gym Access\nLocker Room\nAll Equipment\nGroup Classes\nPersonal Trainer (8/month)\nNutrition Plan\nBody Analysis'),
        ]
        plans = []
        for name, months, price, features in plans_data:
            plan, created = MembershipPlan.objects.get_or_create(
                name=name,
                defaults={'duration_months': months, 'price': price, 'features': features}
            )
            plans.append(plan)
            if created:
                self.stdout.write(f'Created plan: {name}')

        # Members
        members_data = [
            ('Rahul', 'Sharma', 'rahul@example.com'),
            ('Priya', 'Patel', 'priya@example.com'),
            ('Amit', 'Kumar', 'amit@example.com'),
            ('Sneha', 'Reddy', 'sneha@example.com'),
            ('Vikram', 'Singh', 'vikram@example.com'),
            ('Ananya', 'Gupta', 'ananya@example.com'),
            ('Rohit', 'Mehta', 'rohit@example.com'),
            ('Pooja', 'Verma', 'pooja@example.com'),
        ]
        members = []
        for fn, ln, email in members_data:
            if not User.objects.filter(email=email).exists():
                m = User.objects.create_user(
                    username=email.split('@')[0], email=email,
                    password='member123', first_name=fn, last_name=ln, role='member',
                    phone=f'98{random.randint(10000000, 99999999)}'
                )
                self.stdout.write(f'Created member: {email}')
                members.append(m)
            else:
                members.append(User.objects.get(email=email))

        # Assign members to trainers
        if trainers:
            tp = trainers[0].trainer_profile
            for m in members[:4]:
                tp.assigned_members.add(m)
            if len(trainers) > 1:
                tp2 = trainers[1].trainer_profile
                for m in members[4:]:
                    tp2.assigned_members.add(m)

        # Memberships + Payments
        for i, member in enumerate(members):
            plan = plans[i % len(plans)]
            start = date.today() - relativedelta(months=random.randint(0, 3))
            end = start + relativedelta(months=plan.duration_months)
            status = 'active' if end >= date.today() else 'expired'

            membership, created = Membership.objects.get_or_create(
                member=member,
                defaults={'plan': plan, 'start_date': start, 'end_date': end, 'status': status}
            )

            if created:
                # Payment for membership
                Payment.objects.create(
                    member=member,
                    membership=membership,
                    amount=plan.price,
                    payment_date=start,
                    status='paid',
                    payment_method=random.choice(['cash', 'card', 'upi']),
                    transaction_id=f'TXN{random.randint(100000, 999999)}'
                )

        # Attendance records last 14 days
        for day_offset in range(14, 0, -1):
            att_date = date.today() - timedelta(days=day_offset)
            if att_date.weekday() < 6:  # Mon-Sat
                for member in random.sample(members, min(len(members), random.randint(3, len(members)))):
                    Attendance.objects.get_or_create(
                        member=member,
                        date=att_date,
                        defaults={'marked_by': User.objects.filter(role='admin').first()}
                    )

        # Workout plans
        if not WorkoutPlan.objects.exists() and trainers:
            plan1 = WorkoutPlan.objects.create(
                name='Beginner Strength Program',
                description='A 5-day strength training program for beginners',
                trainer=trainers[0]
            )
            days_exercises = {
                'Monday': [('Bench Press', 3, 10, 90), ('Push-ups', 3, 15, 60), ('Dumbbell Fly', 3, 12, 60)],
                'Tuesday': [('Squats', 4, 10, 120), ('Leg Press', 3, 12, 90), ('Lunges', 3, 10, 60)],
                'Wednesday': [('Pull-ups', 3, 8, 90), ('Bent-over Row', 3, 10, 90), ('Lat Pulldown', 3, 12, 60)],
                'Thursday': [('Shoulder Press', 3, 10, 90), ('Lateral Raises', 3, 15, 60), ('Arnold Press', 3, 12, 60)],
                'Friday': [('Deadlift', 4, 6, 120), ('Romanian Deadlift', 3, 10, 90), ('Good Morning', 3, 12, 60)],
            }
            for day_name, exercises in days_exercises.items():
                wd = WorkoutDay.objects.create(plan=plan1, day=day_name)
                for order, (name, sets, reps, rest) in enumerate(exercises):
                    Exercise.objects.create(workout_day=wd, name=name, sets=sets, reps=reps, rest_seconds=rest, order=order)
            for m in members[:4]:
                plan1.assigned_members.add(m)

        # Fitness records
        for member in members:
            base_weight = random.uniform(60, 95)
            for i in range(3, 0, -1):
                FitnessProgress.objects.get_or_create(
                    member=member,
                    date=date.today() - relativedelta(months=i),
                    defaults={
                        'weight_kg': round(base_weight + random.uniform(-2, 2), 1),
                        'height_cm': random.choice([165, 170, 175, 180, 165, 158]),
                        'body_fat_percentage': round(random.uniform(15, 30), 1),
                        'chest_cm': round(random.uniform(85, 105), 1),
                        'waist_cm': round(random.uniform(70, 95), 1),
                        'hips_cm': round(random.uniform(85, 105), 1),
                        'bicep_cm': round(random.uniform(28, 42), 1),
                    }
                )

        self.stdout.write(self.style.SUCCESS('\n✅ Seed data created successfully!'))
        self.stdout.write('  Admin: admin@fittrack.com / admin123')
        self.stdout.write('  Trainer: alex@fittrack.com / trainer123')
        self.stdout.write('  Trainer: sarah@fittrack.com / trainer123')
        self.stdout.write('  Member: rahul@example.com / member123')
