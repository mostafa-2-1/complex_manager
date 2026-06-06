from flask import Blueprint, request, g
from app.services import complex_service
from app.schemas.complex_schema import validate_create_complex, validate_update_complex
from app.utils.decorators import token_required, roles_required
from app.utils.response_helpers import success_response, error_response, paginated_response

complexes_bp = Blueprint('complexes', __name__)


@complexes_bp.route('/complexes', methods=['GET'])
@token_required
@roles_required('super_admin', 'complex_admin', 'building_admin')
def get_complexes():
    """
    GET /complexes
    Access: All authenticated roles
    Query params: page, per_page, search
    """
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search   = request.args.get('search', '', type=str)

    items, pagination = complex_service.get_all_complexes(
        page=page,
        per_page=per_page,
        search=search
    )

    return paginated_response('Complexes retrieved successfully.', items, pagination)


@complexes_bp.route('/complexes/<int:complex_id>', methods=['GET'])
@token_required
def get_complex(complex_id):
    """
    GET /complexes/:id
    Access: All authenticated roles
    Returns complex with its buildings included
    """
    complex_ = complex_service.get_complex_by_id(complex_id)

    if not complex_:
        return error_response('Complex not found.', 404)

    return success_response(
        'Complex retrieved successfully.',
        complex_.to_dict(include_buildings=True)
    )


@complexes_bp.route('/complexes', methods=['POST'])
@token_required
@roles_required('super_admin')
def create_complex():
    """
    POST /complexes
    Access: Super Admin only
    Body includes admin_id to assign an existing complex_admin
    """
    data = request.get_json()

    if not data:
        return error_response('Request body is required.', 400)

    errors = validate_create_complex(data)
    if errors:
        return error_response(errors[0], 400)

    success, message, result = complex_service.create_complex(data)

    if not success:
        return error_response(message, 409)

    return success_response(message, result, 201)


@complexes_bp.route('/complexes/<int:complex_id>', methods=['PUT'])
@token_required
@roles_required('super_admin')
def update_complex(complex_id):
    """
    PUT /complexes/:id
    Access: Super Admin only
    """
    complex_ = complex_service.get_complex_by_id(complex_id)

    if not complex_:
        return error_response('Complex not found.', 404)

    data = request.get_json()

    if not data:
        return error_response('Request body is required.', 400)

    errors = validate_update_complex(data)
    if errors:
        return error_response(errors[0], 400)

    success, message, result = complex_service.update_complex(complex_, data)

    if not success:
        return error_response(message, 400)

    return success_response(message, result)


@complexes_bp.route('/complexes/<int:complex_id>', methods=['DELETE'])
@token_required
@roles_required('super_admin')
def delete_complex(complex_id):
    """
    DELETE /complexes/:id
    Access: Super Admin only
    Hard delete — cascades to buildings
    """
    complex_ = complex_service.get_complex_by_id(complex_id)

    if not complex_:
        return error_response('Complex not found.', 404)

    success, message = complex_service.delete_complex(complex_)

    if not success:
        return error_response(message, 400)

    return success_response(message)