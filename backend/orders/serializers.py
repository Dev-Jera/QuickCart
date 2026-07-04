from django.db import transaction
from products.models import Product
from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemWriteSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderItemReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "quantity", "price"]
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)
    order_items = OrderItemWriteSerializer(many=True, write_only=True)
    customer = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer",
            "items",
            "order_items",
            "total_price",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "items", "total_price", "status", "created_at"]

    def create(self, validated_data):
        items_data = validated_data.pop("order_items")
        request = self.context.get("request")
        user = request.user

        if not items_data:
            raise serializers.ValidationError(
                {"order_items": "At least one item is required."}
            )

        with transaction.atomic():
            order = Order.objects.create(user=user)
            total = 0

            for item in items_data:
                try:
                    product = Product.objects.select_for_update().get(
                        id=item["product_id"]
                    )
                except Product.DoesNotExist as exc:
                    raise serializers.ValidationError(
                        {"order_items": f"Product {item['product_id']} does not exist."}
                    ) from exc

                quantity = item["quantity"]
                if product.stock < quantity:
                    raise serializers.ValidationError(
                        {
                            "order_items": (
                                f"Only {product.stock} unit(s) of {product.name} "
                                "are available."
                            )
                        }
                    )

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=product.price,
                )

                product.stock -= quantity
                product.save(update_fields=["stock"])
                total += product.price * quantity

            order.total_price = total
            order.save(update_fields=["total_price"])

        return order


class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["id", "status"]
        read_only_fields = ["id"]
