from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('memberships.urls')),
    path('api/', include('attendance.urls')),
    path('api/', include('workouts.urls')),
    path('api/', include('payments.urls')),
    path('api/', include('fitness.urls')),
    path('api/', include('analytics.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
