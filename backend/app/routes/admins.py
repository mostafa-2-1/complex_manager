
from flask import Blueprint, request, g
from app.services import admin_service
from app.schemas.admin_schema import validate_create_admin, validate_update_admin
from app.utils.decorators import token_required, roles_required
from app.utils.response_helpers import success_response, error_response, paginated_response

admins_bp = Blueprint('admins', __name__)


@admins_bp.route('/admins', methods=['GET'])
@token_required
def get_admins():
    """
    GET /admins
    Access: All authenticated roles
    Query params: page, per_page, search, role, status
    """
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search   = request.args.get('search', '', type=str)
    role     = request.args.get('role', '', type=str)
    status   = request.args.get('status', '', type=str)

    items, pagination = admin_service.get_all_admins(
        page=page,
        per_page=per_page,
        search=search,
        role=role,
        status=status
    )

    return paginated_response('Admins retrieved successfully.', items, pagination)


@admins_bp.route('/admins/<int:admin_id>', methods=['GET'])
@token_required
def get_admin(admin_id):
    """
    GET /admins/:id
    Access: All authenticated roles
    """
    admin = admin_service.get_admin_by_id(admin_id)

    if not admin:
        return error_response('Admin not found.', 404)

    return success_response('Admin retrieved successfully.', admin.to_dict())


@admins_bp.route('/admins', methods=['POST'])
@roles_required('super_admin')
def create_admin():
    """
    POST /admins
    Access: Super Admin only
    """
    data = request.get_json()

    if not data:
        return error_response('Request body is required.', 400)

    # ── Validate input ────────────────────────────────────────
    errors = validate_create_admin(data)
    if errors:
        return error_response(errors[0], 400)

    success, message, result = admin_service.create_admin(data)

    if not success:
        return error_response(message, 409)

    return success_response(message, result, 201)


@admins_bp.route('/admins/<int:admin_id>', methods=['PUT'])
@roles_required('super_admin')
def update_admin(admin_id):
    """
    PUT /admins/:id
    Access: Super Admin only
    """
    admin = admin_service.get_admin_by_id(admin_id)

    if not admin:
        return error_response('Admin not found.', 404)

    data = request.get_json()

    if not data:
        return error_response('Request body is required.', 400)

    # ── Validate input ────────────────────────────────────────
    errors = validate_update_admin(data)
    if errors:
        return error_response(errors[0], 400)

    success, message, result = admin_service.update_admin(admin, data)

    if not success:
        return error_response(message, 409)

    return success_response(message, result)


@admins_bp.route('/admins/<int:admin_id>', methods=['DELETE'])
@roles_required('super_admin')
def delete_admin(admin_id):
    """
    DELETE /admins/:id
    Access: Super Admin only
    """
    admin = admin_service.get_admin_by_id(admin_id)

    if not admin:
        return error_response('Admin not found.', 404)

    success, message, _ = admin_service.delete_admin(admin, g.current_admin.id)

    if not success:
        return error_response(message, 400)

    return success_response(message)