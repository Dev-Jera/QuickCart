# Generated for QuickCart product filtering.

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="category",
            field=models.CharField(
                choices=[
                    ("electronics", "Electronics"),
                    ("fashion", "Fashion"),
                    ("home", "Home"),
                    ("beauty", "Beauty"),
                    ("sports", "Sports"),
                    ("other", "Other"),
                ],
                db_index=True,
                default="other",
                max_length=50,
            ),
        ),
    ]
