from app.extensions import db
from app.models.building import Building
from app.models.complex import ResidentialComplex
from app.models.admin import Admin
from sqlalchemy import or_


def get_all_buildings(
    page: int       = 1,
    per_page: int   = 10,
    search: str     = '',
    complex_id: int = None
):
    """
    Fetch paginated buildings with optional search and complex filter.

    Returns:
        (items: list[dict], pagination object)
    """
    query = Building.query

    # ── Filter by complex ─────────────────────────────────────
    if complex_id:
        query = query.filter(Building.complex_id == complex_id)

    # ── Search across name + address ──────────────────────────
    if search:
        term = f'%{search.strip()}%'
        query = query.filter(
            or_(
                Building.name.ilike(term),
                Building.address.ilike(term)
            )
        )

    paginated = query.order_by(Building.created_at.desc()).paginate(
        page=page,
        per_page=min(per_page, 100),
        error_out=False
    )

    return [b.to_dict() for b in paginated.items], paginated


def get_building_by_id(building_id: int) -> Building | None:
    """Fetch a single building by ID. Returns None if not found."""
    return Building.query.get(building_id)


def create_building(data: dict) -> tuple[bool, str, dict | None]:
    """
    Create a building and assign an existing building_admin.

    Returns:
        (success: bool, message: str, data: dict | None)
    """
    # ── Verify complex exists ─────────────────────────────────
    complex_ = ResidentialComplex.query.get(int(data['complex_id']))
    if not complex_:
        return False, 'Residential complex not found.', None

    # ── Validate the assigned admin ────────────────────────────
    admin_id = data.get('admin_id')
    admin = Admin.query.get(admin_id)

    if not admin:
        return False, 'Selected admin not found.', None

    if admin.role != 'building_admin':
        return False, 'Selected admin must be a building_admin.', None

   

    # ── Create building ───────────────────────────────────────
    building = Building(
        name       = data['name'].strip(),
        address    = data['address'].strip(),
        floors     = data.get('floors'),
        units      = data.get('units'),
        complex_id = int(data['complex_id']),
        admin_id   = admin.id
    )
    db.session.add(building)
    db.session.commit()

    return True, 'Building created successfully.', building.to_dict()


def update_building(
    building: Building,
    data: dict,
    current_admin
) -> tuple[bool, str, dict | None]:
    """
    Update a building.
    Building admins can only update their own building.

    Returns:
        (success: bool, message: str, data: dict | None)
    """
    # ── Ownership check for building_admin ────────────────────
    if current_admin.role == 'building_admin':
        if building.admin_id != current_admin.id:
            return False, 'You can only update your own building.', None

    # ── Admin reassignment (super_admin/complex_admin only) ───
    if 'admin_id' in data and data['admin_id'] and current_admin.role != 'building_admin':
        new_admin_id = data['admin_id']
        admin = Admin.query.get(new_admin_id)

        if not admin:
            return False, 'Selected admin not found.', None

        if admin.role != 'building_admin':
            return False, 'Selected admin must be a building_admin.', None

       
        building.admin_id = admin.id

    if 'name' in data:
        building.name = data['name'].strip()

    if 'address' in data:
        building.address = data['address'].strip()

    if 'floors' in data:
        building.floors = data['floors']

    if 'units' in data:
        building.units = data['units']

    # ── Only super_admin/complex_admin can reassign complex ────
    if 'complex_id' in data and current_admin.role != 'building_admin':
        complex_ = ResidentialComplex.query.get(int(data['complex_id']))
        if not complex_:
            return False, 'Residential complex not found.', None
        building.complex_id = int(data['complex_id'])

    db.session.commit()

    return True, 'Building updated successfully.', building.to_dict()


def delete_building(building: Building) -> tuple[bool, str]:
    """
    Hard delete a building.
    Role check is already done by the @roles_required decorator.

    Returns:
        (success: bool, message: str)
    """
    db.session.delete(building)
    db.session.commit()

    return True, 'Building deleted successfully.'