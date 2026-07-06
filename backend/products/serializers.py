from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", read_only=True)
    category_name = serializers.CharField(write_only=True, required=False)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        required=False,
    )
    category_slug = serializers.SlugField(source="category.slug", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "category",
            "category_name",
            "category_id",
            "category_slug",
            "price",
            "stock",
            "image",
            "image_url",
            "created_at",
        ]
        read_only_fields = ["id", "category_slug", "created_at"]

    def to_internal_value(self, data):
        # Older clients sent "category" as text. New clients send category_id.
        # Supporting both keeps existing forms/tests from breaking after the
        # category table was added.
        if "category" in data and "category_name" not in data and "category_id" not in data:
            data = data.copy()
            category_value = data.pop("category")
            if isinstance(category_value, list):
                category_value = category_value[0] if category_value else ""
            data["category_name"] = category_value
        return super().to_internal_value(data)

    def _resolve_category(self, attrs):
        if attrs.get("category"):
            return attrs

        category_name = attrs.pop("category_name", "")
        if not category_name:
            if self.instance:
                return attrs
            category_name = "Other"

        # Admin users can type a new category name and keep moving.
        # The API reuses an existing category when the slug/name already exists.
        slug = str(category_name).strip().lower()
        category = (
            Category.objects.filter(slug=slug).first()
            or Category.objects.filter(name__iexact=category_name).first()
        )
        if not category:
            category = Category.objects.create(name=str(category_name).strip().title())
        attrs["category"] = category
        return attrs

    def create(self, validated_data):
        return super().create(self._resolve_category(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._resolve_category(validated_data))
