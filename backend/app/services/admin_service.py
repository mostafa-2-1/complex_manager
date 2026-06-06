
from app.extensions import db
from app.models.admin import Admin
from app.utils.auth_helpers import hash_password
from sqlalchemy import or_, func


def get_all_admins(
    page: int       = 1,
    per_page: int   = 10,
    search: str     = '',
    role: str       = '',
    status: str     = ''
):
    """
    Fetch paginated admins with optional search and filters.

    Returns:
        (items: list[dict], pagination object)
    """
    query = Admin.query

    # ── Search across name + email + phone ────────────────────
    search = search.strip()

    if search:
        words = search.split()

        for word in words:
            term = f"%{word}%"

            query = query.filter(
                or_(
                    Admin.first_name.ilike(term),
                    Admin.last_name.ilike(term),
                    Admin.email.ilike(term),
                    Admin.phone.ilike(term)
                )
            )

    # ── Role filter ───────────────────────────────────────────
    if role:
        query = query.filter(Admin.role == role)

    # ── Status filter ─────────────────────────────────────────
    if status:
        query = query.filter(Admin.status == status)

    # ── Paginate ──────────────────────────────────────────────
    paginated = query.order_by(Admin.created_at.desc()).paginate(
        page=page,
        per_page=min(per_page, 100),  # Hard cap at 100
        error_out=False
    )

    return [a.to_dict() for a in paginated.items], paginated


def get_admin_by_id(admin_id: int) -> Admin | None:
    """Fetch a single admin by ID. Returns None if not found."""
    return Admin.query.get(admin_id)


def create_admin(data: dict) -> tuple[bool, str, dict | None]:
    """
    Create a new standalone admin.

    Returns:
        (success: bool, message: str, data: dict | None)
    """
    # ── Email uniqueness check ────────────────────────────────
    email = data['email'].lower().strip()
    if Admin.query.filter_by(email=email).first():
        return False, 'An admin with this email already exists.', None

    phone = data.get('phone', '').strip() or None

    if phone and Admin.query.filter_by(phone=phone).first():
        return False, 'An admin with this phone number already exists.', None

    admin = Admin(
        civility      = data['civility'],
        first_name    = data['first_name'].strip(),
        last_name     = data['last_name'].strip(),
        email         = email,
        phone         = phone,
        role          = data['role'],
        status        = data.get('status', 'active'),
        password_hash = hash_password(data['password'])
    )

    db.session.add(admin)
    db.session.commit()

    return True, 'Admin created successfully.', admin.to_dict()


def update_admin(admin: Admin, data: dict) -> tuple[bool, str, dict | None]:
    """
    Update an existing admin with provided fields.
    Only updates fields that are present in data.

    Returns:
        (success: bool, message: str, data: dict | None)
    """
    # ── Email uniqueness check (exclude self) ─────────────────
    if 'email' in data:
        email = data['email'].lower().strip()
        existing = Admin.query.filter_by(email=email).first()
        if existing and existing.id != admin.id:
            return False, 'This email is already in use by another admin.', None
        admin.email = email

    if 'phone' in data:
        phone = data['phone'].strip() or None

        if phone:
            existing = Admin.query.filter_by(phone=phone).first()
        
            if existing and existing.id != admin.id:
                return False, 'This phone number is already in use by another admin.', None

        admin.phone = phone

      
    if 'civility' in data:
        admin.civility = data['civility']

    if 'first_name' in data:
        admin.first_name = data['first_name'].strip()

    if 'last_name' in data:
        admin.last_name = data['last_name'].strip()

    if 'phone' in data:
        admin.phone = data['phone'].strip()

    if 'role' in data:
        admin.role = data['role']

    if 'status' in data:
        admin.status = data['status']

    # ── Password update (optional) ────────────────────────────
    if 'password' in data and data['password']:
        admin.password_hash = hash_password(data['password'])

    db.session.commit()

    return True, 'Admin updated successfully.', admin.to_dict()


def delete_admin(admin: Admin, current_admin_id: int) -> tuple[bool, str, dict | None]:
    """
    Delete an admin.
    Prevents self-deletion.

    Returns:
        (success: bool, message: str, data: None)
    """
    if admin.id == current_admin_id:
        return False, 'You cannot delete your own account.', None

    db.session.delete(admin)
    db.session.commit()

    return True, 'Admin deleted successfully.', None