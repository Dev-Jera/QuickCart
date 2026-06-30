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

    class Meta:
        model = Order
        fields = ["id", "items", "order_items", "total_price", "status", "created_at"]
        read_only_fields = ["id", "items", "total_price", "status", "created_at"]

    def create(self, validated_data):
        items_data = validated_data.pop("order_items")

        request = self.context.get("request")
        user = request.user

        order = Order.objects.create(user=user)

        total = 0

        for item in items_data:
            try:
                product = Product.objects.get(id=item["product_id"])
            except Product.DoesNotExist as exc:
                raise serializers.ValidationError(
                    {"order_items": f"Product {item['product_id']} does not exist."}
                ) from exc

            quantity = item["quantity"]

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price,
            )

            total += product.price * quantity

        order.total_price = total
        order.save()

        return order
