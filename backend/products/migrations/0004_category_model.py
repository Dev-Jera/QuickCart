from django.db import migrations, models
import django.db.models.deletion
import django.utils.text


DEFAULT_CATEGORIES = [
    ("electronics", "Electronics"),
    ("fashion", "Fashion"),
    ("home", "Home"),
    ("beauty", "Beauty"),
    ("sports", "Sports"),
    ("other", "Other"),
]


def migrate_categories(apps, schema_editor):
    Category = apps.get_model("products", "Category")
    Product = apps.get_model("products", "Product")

    category_by_slug = {}
    for slug, name in DEFAULT_CATEGORIES:
        category, _ = Category.objects.get_or_create(slug=slug, defaults={"name": name})
        category_by_slug[slug] = category

    for product in Product.objects.all():
        raw_category = product.category_name or "other"
        slug = django.utils.text.slugify(raw_category) or "other"
        category = category_by_slug.get(slug)
        if category is None:
            category, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={"name": str(raw_category).strip().title()},
            )
            category_by_slug[slug] = category
        product.category = category
        product.save(update_fields=["category"])


def restore_category_names(apps, schema_editor):
    Product = apps.get_model("products", "Product")
    for product in Product.objects.select_related("category"):
        product.category_name = product.category.slug if product.category_id else "other"
        product.save(update_fields=["category_name"])


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0003_product_image_url"),
    ]

    operations = [
        migrations.RenameField(
            model_name="product",
            old_name="category",
            new_name="category_name",
        ),
        migrations.CreateModel(
            name="Category",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100, unique=True)),
                ("slug", models.SlugField(blank=True, max_length=120, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name_plural": "Categories",
                "ordering": ["name"],
            },
        ),
        migrations.AddField(
            model_name="product",
            name="category",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="products",
                to="products.category",
            ),
        ),
        migrations.RunPython(migrate_categories, restore_category_names),
        migrations.AlterField(
            model_name="product",
            name="category",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="products",
                to="products.category",
            ),
        ),
        migrations.RemoveField(
            model_name="product",
            name="category_name",
        ),
    ]
