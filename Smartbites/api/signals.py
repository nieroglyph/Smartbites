from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import UserProfile

CustomUser = get_user_model()  # Get custom user model

@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a user profile when a new user registers"""
    if created:
        UserProfile.objects.create(user=instance, dietary_preference='omnivore')  # Set default

@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    """Save user profile when user updates account"""
    instance.userprofile.save()
