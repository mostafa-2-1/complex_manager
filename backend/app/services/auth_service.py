from app.models.admin import Admin
from app.utils.auth_helpers import check_password
from flask_jwt_extended import create_access_token

def login(email: str, password: str) -> tuple[bool, str, dict | None]:
    """
    Authenticate an admin by email and password.

    Returns:
        (success: bool, message: str, data: dict | None)
    """
    admin = Admin.query.filter_by(email=email.lower().strip()).first()

    if not admin:
        return False, 'Invalid email or password.', None

    if not check_password(password, admin.password_hash):
        return False, 'Invalid email or password.', None

    if admin.status != 'active':
        return False, 'Account is inactive. Contact Super Admin.', None

    token = create_access_token(
        identity=str(admin.id),
        additional_claims={"role": admin.role, "email": admin.email}
    )

    data = {
        'token': token,
        'admin': admin.to_dict()
    }

    return True, 'Login successful.', data