from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Product


class ProductApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin", password="pass12345", is_staff=True
        )
        self.customer = User.objects.create_user(
            username="customer", password="pass12345"
        )
        self.electronics = Category.objects.get(slug="electronics")
        self.home = Category.objects.get(slug="home")
        Product.objects.create(
            name="Wireless Mouse",
            description="Ergonomic mouse",
            category=self.electronics,
            price="25.00",
            stock=10,
        )
        Product.objects.create(
            name="Desk Lamp",
            description="LED lamp",
            category=self.home,
            price="45.00",
            stock=4,
        )

    def test_customer_can_browse_and_filter_products(self):
        response = self.client.get("/api/products/?category=electronics&search=mouse")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Wireless Mouse")

    def test_customer_can_list_categories(self):
        response = self.client.get("/api/categories/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 2)

    def test_non_admin_cannot_create_product(self):
        self.client.force_authenticate(self.customer)

        response = self.client.post(
            "/api/products/",
            {
                "name": "Sneakers",
                "description": "Running shoes",
                "category": "fashion",
                "price": "59.99",
                "stock": 5,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_manage_products(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            "/api/products/",
            {
                "name": "Face Cream",
                "description": "Daily moisturizer",
                "category": "beauty",
                "price": "12.50",
                "stock": 20,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(Product.objects.filter(name="Face Cream").exists())
        self.assertTrue(Category.objects.filter(slug="beauty").exists())
