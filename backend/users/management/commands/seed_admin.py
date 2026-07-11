import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create the QuickCart admin account only when it does not exist."

    def add_arguments(self, parser):
        parser.add_argument("--username", default=os.getenv("ADMIN_USERNAME", "quickcart_admin"))
        parser.add_argument("--email", default=os.getenv("ADMIN_EMAIL", "admin@quickcart.local"))
        parser.add_argument("--password", default=os.getenv("ADMIN_PASSWORD", "QuickCartAdmin123"))

    def handle(self, *args, **options):
        username = options["username"]
        email = options["email"]
        password = options["password"]

        if User.objects.filter(username=username).exists():
            self.stdout.write(f"Admin user already exists: {username}")
            return

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        self.stdout.write(self.style.SUCCESS(f"Created admin user: {user.username}"))
