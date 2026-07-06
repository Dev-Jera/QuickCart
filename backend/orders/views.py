from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .models import Order
from .permissions import IsAdminForStatusUpdates
from .serializers import OrderSerializer, OrderStatusSerializer


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminForStatusUpdates]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        queryset = Order.objects.prefetch_related("items__product").order_by("-created_at")

        # Staff users need the whole queue for fulfilment.
        # Customers should only ever see their own order history.
        if self.request.user.is_staff:
            return queryset

        return queryset.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "partial_update":
            return OrderStatusSerializer

        return OrderSerializer

    def get_serializer_context(self):
        return {"request": self.request}

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAdminUser],
        url_path="analytics",
    )
    def analytics(self, request):
        queryset = Order.objects.all()
        # Cancelled orders should stay visible in counts, but not inflate revenue.
        completed_orders = queryset.exclude(status="cancelled")
        revenue = sum(order.total_price for order in completed_orders)

        return Response(
            {
                "total_orders": queryset.count(),
                "pending_orders": queryset.filter(status="pending").count(),
                "completed_orders": queryset.filter(status="completed").count(),
                "revenue": revenue,
            }
        )
