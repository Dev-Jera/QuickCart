import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create or update the local QuickCart admin account."

    def add_arguments(self, parser):
        parser.add_argument("--username", default=os.getenv("ADMIN_USERNAME", "quickcart_admin"))
        parser.add_argument("--email", default=os.getenv("ADMIN_EMAIL", "admin@quickcart.local"))
        parser.add_argument("--password", default=os.getenv("ADMIN_PASSWORD", "QuickCartAdmin123"))

    def handle(self, *args, **options):
        username = options["username"]
        email = options["email"]
        password = options["password"]

        # This command is safe to run more than once. It is handy after a fresh
        # database setup, and it also fixes an admin account that lost staff flags.
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            },
        )

        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{action} admin user: {username}"))
