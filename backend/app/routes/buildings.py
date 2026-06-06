from flask import Blueprint, request, g
from app.services import building_service
from app.schemas.building_schema import validate_create_building, validate_update_building
from app.utils.decorators import token_required, roles_required
from app.utils.response_helpers import success_response, error_response, paginated_response

buildings_bp = Blueprint('buildings', __name__)


@buildings_bp.route('/buildings', methods=['GET'])
@token_required
def get_buildings():
    """
    GET /buildings
    Access: All authenticated roles
    Query params: page, per_page, search, complex_id
    """
    page       = request.args.get('page', 1, type=int)
    per_page   = request.args.get('per_page', 10, type=int)
    search     = request.args.get('search', '', type=str)
    complex_id = request.args.get('complex_id', None, type=int)

    items, pagination = building_service.get_all_buildings(
        page=page,
        per_page=per_page,
        search=search,
        complex_id=complex_id
    )

    return paginated_response('Buildings retrieved successfully.', items, pagination)


@buildings_bp.route('/buildings/<int:building_id>', methods=['GET'])
@token_required
def get_building(building_id):
    """
    GET /buildings/:id
    Access: All authenticated roles
    """
    building = building_service.get_building_by_id(building_id)

    if not building:
        return error_response('Building not found.', 404)

    return success_response('Building retrieved successfully.', building.to_dict())


@buildings_bp.route('/buildings', methods=['POST'])
@token_required
@roles_required('super_admin', 'complex_admin')
def create_building():
    """
    POST /buildings
    Access: Super Admin + Complex Admin
    Body includes admin_id to assign an existing building_admin
    """
    data = request.get_json()

    if not data:
        return error_response('Request body is required.', 400)

    errors = validate_create_building(data)
    if errors:
        return error_response(errors[0], 400)

    success, message, result = building_service.create_building(data)

    if not success:
        return error_response(message, 409 if 'already' in message else 404)

    return success_response(message, result, 201)


@buildings_bp.route('/buildings/<int:building_id>', methods=['PUT'])
@token_required
@roles_required('super_admin', 'complex_admin', 'building_admin')
def update_building(building_id):
    """
    PUT /buildings/:id
    Access:
      - super_admin    → any building
      - complex_admin  → any building
      - building_admin → own building only (enforced in service)
    """
    building = building_service.get_building_by_id(building_id)

    if not building:
        return error_response('Building not found.', 404)

    data = request.get_json()

    if not data:
        return error_response('Request body is required.', 400)

    errors = validate_update_building(data)
    if errors:
        return error_response(errors[0], 400)

    success, message, result = building_service.update_building(
        building,
        data,
        g.current_admin
    )

    if not success:
        return error_response(message, 403 if 'own' in message else 400)

    return success_response(message, result)


@buildings_bp.route('/buildings/<int:building_id>', methods=['DELETE'])
@token_required
@roles_required('super_admin')
def delete_building(building_id):
    """
    DELETE /buildings/:id
    Access: Super Admin only
    """
    building = building_service.get_building_by_id(building_id)

    if not building:
        return error_response('Building not found.', 404)

    success, message = building_service.delete_building(building)

    if not success:
        return error_response(message, 400)

    return success_response(message)