from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminForStatusUpdates(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS or request.method == "POST":
            return bool(request.user and request.user.is_authenticated)

        return bool(request.user and request.user.is_staff)
