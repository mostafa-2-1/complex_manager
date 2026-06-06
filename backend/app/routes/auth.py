
from flask import Blueprint, request, g
from app.services.auth_service import login as auth_login
from app.utils.decorators import token_required
from app.utils.response_helpers import success_response, error_response

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    POST /login
    Public — no token required.
    Body: { email, password }
    """
    data = request.get_json()

    if not data:
        return error_response('Request body is required.', 400)

    email    = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return error_response('Email and password are required.', 400)

    success, message, result = auth_login(email, password)

    if not success:
        return error_response(message, 401)

    return success_response(message, result, 200)


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me():
    """
    GET /me
    Returns the currently authenticated admin's profile.
    """
    return success_response('Profile retrieved successfully.', g.current_admin.to_dict())


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """
    POST /logout
    NOTE: JWT is stateless — no server-side invalidation.
    The client is responsible for removing the token.
    This endpoint exists for frontend convention only.
    """
    return success_response('Logged out successfully. Please remove your token.')