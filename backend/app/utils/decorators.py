from functools import wraps
from flask import request, g
from flask_jwt_extended import jwt_required, get_jwt
from app.utils.response_helpers import error_response
from app.models.admin import Admin

def token_required(f):
    """
    Decorator that validates the JWT token on every protected route.
    On success → sets g.current_admin for use inside the route.
    On failure → returns 401/403 error response.
    """
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        # ── Get admin ID from JWT ──────────────────────────────
        admin_id = get_jwt()["sub"]

        # ── Load admin from DB ─────────────────────────────────
        admin = Admin.query.get(admin_id)

        if not admin:
            return error_response('Admin account not found.', 401)

        if admin.status != 'active':
            return error_response('Account is inactive. Contact Super Admin.', 403)

        # ── Attach to Flask request context ───────────────────
        g.current_admin = admin

        return f(*args, **kwargs)
    return decorated

def roles_required(*allowed_roles):
    """
    Decorator factory for role-based access control.
    Always applies token_required first.

    Usage:
        @roles_required('super_admin')
        @roles_required('super_admin', 'complex_admin')
    """
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            if g.current_admin.role not in allowed_roles:
                return error_response(
                    f'Access denied. Required role: {" or ".join(allowed_roles)}.',
                    403
                )
            return f(*args, **kwargs)
        return decorated
    return decorator