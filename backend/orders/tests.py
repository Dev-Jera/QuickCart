from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from products.models import Category, Product

from .models import Order


class OrderApiTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            username="customer", password="pass12345"
        )
        self.other_customer = User.objects.create_user(
            username="other", password="pass12345"
        )
        self.admin = User.objects.create_user(
            username="admin", password="pass12345", is_staff=True
        )
        self.category = Category.objects.get(slug="fashion")
        self.product = Product.objects.create(
            name="Backpack",
            description="Travel backpack",
            category=self.category,
            price="80.00",
            stock=5,
        )

    def test_customer_can_place_order_and_stock_is_reduced(self):
        self.client.force_authenticate(self.customer)

        response = self.client.post(
            "/api/orders/",
            {"order_items": [{"product_id": self.product.id, "quantity": 2}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["total_price"], "160.00")
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)

    def test_order_rejects_quantity_above_stock(self):
        self.client.force_authenticate(self.customer)

        response = self.client.post(
            "/api/orders/",
            {"order_items": [{"product_id": self.product.id, "quantity": 6}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_customer_only_sees_own_orders(self):
        Order.objects.create(user=self.customer, total_price="80.00")
        Order.objects.create(user=self.other_customer, total_price="80.00")
        self.client.force_authenticate(self.customer)

        response = self.client.get("/api/orders/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["customer"], "customer")

    def test_admin_can_view_all_orders_and_update_status(self):
        order = Order.objects.create(user=self.customer, total_price="80.00")
        Order.objects.create(user=self.other_customer, total_price="80.00")
        self.client.force_authenticate(self.admin)

        list_response = self.client.get("/api/orders/")
        patch_response = self.client.patch(
            f"/api/orders/{order.id}/", {"status": "completed"}, format="json"
        )

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data["count"], 2)
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, "completed")

    def test_admin_can_view_order_analytics(self):
        Order.objects.create(user=self.customer, total_price="80.00", status="completed")
        Order.objects.create(user=self.other_customer, total_price="20.00")
        self.client.force_authenticate(self.admin)

        response = self.client.get("/api/orders/analytics/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_orders"], 2)
        self.assertEqual(response.data["revenue"], 100)
