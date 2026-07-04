from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Profile


class UserApiTests(APITestCase):
    def test_customer_can_register(self):
        response = self.client.post(
            "/api/register/",
            {
                "username": "customer",
                "email": "customer@example.com",
                "password": "pass12345",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="customer")
        self.assertTrue(Profile.objects.filter(user=user).exists())

    def test_authenticated_user_can_view_profile(self):
        user = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="pass12345",
        )
        self.client.force_authenticate(user)

        response = self.client.get("/api/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "customer")
