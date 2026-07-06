from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock", "created_at", "row_actions")
    list_filter = ("category", "created_at")
    search_fields = ("name", "description")
    ordering = ("-created_at",)
    fieldsets = (
        ("Basic information", {
            "fields": ("name", "description", "category"),
        }),
        ("Pricing & inventory", {
            "fields": ("price", "stock"),
        }),
        ("Media", {
            "fields": ("image", "image_url"),
        }),
    )

    @admin.display(description="Actions")
    def row_actions(self, obj):
        change_url = reverse("admin:products_product_change", args=[obj.pk])
        delete_url = reverse("admin:products_product_delete", args=[obj.pk])
        return format_html(
            '<div class="quickcart-row-actions">'
            '<a class="quickcart-row-button edit" href="{}">Edit</a>'
            '<a class="quickcart-row-button delete" href="{}">Delete</a>'
            '</div>',
            change_url,
            delete_url,
        )

