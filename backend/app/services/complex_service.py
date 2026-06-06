from datetime import datetime
from app.extensions import db
from app.models.complex import ResidentialComplex
from app.models.admin import Admin
from sqlalchemy import or_


def get_all_complexes(
    page: int     = 1,
    per_page: int = 10,
    search: str   = ''
):
    """
    Fetch paginated complexes with optional search.

    Returns:
        (items: list[dict], pagination object)
    """
    query = ResidentialComplex.query

    if search:
        term = f'%{search.strip()}%'
        query = query.filter(
            or_(
                ResidentialComplex.name.ilike(term),
                ResidentialComplex.city.ilike(term),
                ResidentialComplex.address.ilike(term)
            )
        )

    paginated = query.order_by(ResidentialComplex.created_at.desc()).paginate(
        page=page,
        per_page=min(per_page, 100),
        error_out=False
    )

    return [c.to_dict() for c in paginated.items], paginated


def get_complex_by_id(complex_id: int) -> ResidentialComplex | None:
    """Fetch a single complex by ID including its buildings."""
    return ResidentialComplex.query.get(complex_id)


def create_complex(data: dict) -> tuple[bool, str, dict | None]:
    """
    Create a residential complex and assign an existing complex_admin.

    Returns:
        (success: bool, message: str, data: dict | None)
    """
    # ── Validate the assigned admin ────────────────────────────
    admin_id = data.get('admin_id')
    admin = Admin.query.get(admin_id)

    if admin is None:
        return False, 'Selected admin not found.', None

    if admin.role != 'complex_admin':
        return False, 'Selected admin must be a complex_admin.', None

    

    # ── Parse campaign dates ───────────────────────────────────
    campaign_start = None
    campaign_end   = None

    if data.get('campaign_start_date'):
        campaign_start = datetime.strptime(data['campaign_start_date'], '%Y-%m-%d').date()

    if data.get('campaign_end_date'):
        campaign_end = datetime.strptime(data['campaign_end_date'], '%Y-%m-%d').date()

    # ── Campaign date business rule ──────────────────────────
    if campaign_start and campaign_end:
        if campaign_end <= campaign_start:
            return (
                False,
                'campaign_end_date must be after campaign_start_date.',
                None
            )
    
    # ── Create the complex ────────────────────────────────────
    complex_ = ResidentialComplex(
        name                = data['name'].strip(),
        address             = data['address'].strip(),
        city                = data['city'].strip(),
        postal_code         = data.get('postal_code', '').strip(),
        campaign_name       = data.get('campaign_name', '').strip(),
        campaign_start_date = campaign_start,
        campaign_end_date   = campaign_end,
        admin_id            = admin.id
    )
    db.session.add(complex_)
    db.session.commit()

    return True, 'Residential complex created successfully.', complex_.to_dict()


def update_complex(complex_: ResidentialComplex, data: dict) -> tuple[bool, str, dict | None]:
    """
    Update an existing complex with provided fields.

    Returns:
        (success: bool, message: str, data: dict | None)
    """
    # ── Admin reassignment ─────────────────────────────────────
    if 'admin_id' in data and data['admin_id']:
        new_admin_id = data['admin_id']
        admin = Admin.query.get(new_admin_id)

        if not admin:
            return False, 'Selected admin not found.', None

        if admin.role != 'complex_admin':
            return False, 'Selected admin must be a complex_admin.', None

       
        complex_.admin_id = admin.id

    if 'name' in data:
        complex_.name = data['name'].strip()

    if 'address' in data:
        complex_.address = data['address'].strip()

    if 'city' in data:
        complex_.city = data['city'].strip()

    if 'postal_code' in data:
        complex_.postal_code = data['postal_code'].strip()

    if 'campaign_name' in data:
        complex_.campaign_name = data['campaign_name'].strip()

    if 'campaign_start_date' in data and data['campaign_start_date']:
        complex_.campaign_start_date = datetime.strptime(
            data['campaign_start_date'], '%Y-%m-%d'
        ).date()

    if 'campaign_end_date' in data and data['campaign_end_date']:
        complex_.campaign_end_date = datetime.strptime(
            data['campaign_end_date'], '%Y-%m-%d'
        ).date()

    # ── Campaign date business rule ──────────────────────────
    if (
        complex_.campaign_start_date
        and complex_.campaign_end_date
        and complex_.campaign_end_date <= complex_.campaign_start_date
    ):
        return (
            False,
            'campaign_end_date must be after campaign_start_date.',
            None
        )


    db.session.commit()

    return True, 'Complex updated successfully.', complex_.to_dict()


def delete_complex(complex_: ResidentialComplex) -> tuple[bool, str]:
    """
    Hard delete a complex.
    Role check is already done by the @roles_required decorator.

    Returns:
        (success: bool, message: str)
    """
    db.session.delete(complex_)
    db.session.commit()

    return True, 'Complex deleted successfully.'