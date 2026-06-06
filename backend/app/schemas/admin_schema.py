
import re

VALID_CIVILITIES = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']
VALID_ROLES      = ['super_admin', 'complex_admin', 'building_admin']
VALID_STATUSES   = ['active', 'inactive']


def _validate_email_format(email: str) -> bool:
    """Basic email format check using regex"""
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(pattern, email) is not None


def validate_create_admin(data: dict) -> list[str]:
    """
    Validates payload for POST /admins.
    Returns a list of error strings.
    Empty list means validation passed.
    """
    errors = []

    # ── Required fields ───────────────────────────────────────
    required = ['civility', 'first_name', 'last_name', 'email', 'password', 'role']
    for field in required:
        if not data.get(field) or not str(data[field]).strip():
            errors.append(f'{field} is required.')

    # Stop early if required fields are missing
    if errors:
        return errors

    # ── Civility ──────────────────────────────────────────────
    if data['civility'] not in VALID_CIVILITIES:
        errors.append(f'civility must be one of: {", ".join(VALID_CIVILITIES)}.')

    # ── Name lengths ──────────────────────────────────────────
    if len(data['first_name'].strip()) < 2:
        errors.append('first_name must be at least 2 characters.')

    if len(data['last_name'].strip()) < 2:
        errors.append('last_name must be at least 2 characters.')

    # ── Email ─────────────────────────────────────────────────
    if not _validate_email_format(data['email'].strip()):
        errors.append('email format is invalid.')

    # ── Phone (optional) ──────────────────────────────────────
    if data.get('phone'):
        phone = str(data['phone']).strip()

        if not _validate_phone(phone):
            errors.append(
                'phone must contain only digits and be between 7 and 15 digits long.'
            )

    # ── Role ──────────────────────────────────────────────────
    if data['role'] not in VALID_ROLES:
        errors.append(f'role must be one of: {", ".join(VALID_ROLES)}.')

    # ── Status (optional, has default) ────────────────────────
    if 'status' in data and data['status'] not in VALID_STATUSES:
        errors.append(f'status must be one of: {", ".join(VALID_STATUSES)}.')

    # ── Password ──────────────────────────────────────────────
    if len(data['password']) < 8:
        errors.append('password must be at least 8 characters.')

    return errors


def validate_update_admin(data: dict) -> list[str]:
    """
    Validates payload for PUT /admins/:id.
    All fields are optional — only validate what is present.
    Returns a list of error strings.
    """
    errors = []

    if not data:
        errors.append('Request body cannot be empty.')
        return errors

    if 'civility' in data and data['civility'] not in VALID_CIVILITIES:
        errors.append(f'civility must be one of: {", ".join(VALID_CIVILITIES)}.')

    if 'first_name' in data and len(str(data['first_name']).strip()) < 2:
        errors.append('first_name must be at least 2 characters.')

    if 'last_name' in data and len(str(data['last_name']).strip()) < 2:
        errors.append('last_name must be at least 2 characters.')

    if 'email' in data and not _validate_email_format(str(data['email']).strip()):
        errors.append('email format is invalid.')

    if 'phone' in data and data['phone']:
        phone = str(data['phone']).strip()

        if not _validate_phone(phone):
            errors.append(
                'phone must contain only digits and be between 7 and 15 digits long.'
            )

    if 'role' in data and data['role'] not in VALID_ROLES:
        errors.append(f'role must be one of: {", ".join(VALID_ROLES)}.')

    if 'status' in data and data['status'] not in VALID_STATUSES:
        errors.append(f'status must be one of: {", ".join(VALID_STATUSES)}.')

    if 'password' in data and data['password'] and len(data['password']) < 8:
        errors.append('password must be at least 8 characters.')

    return errors


def _validate_phone(phone: str) -> bool:
    """
    Allows digits only.
    Length between 7 and 15.
    """
    return phone.isdigit() and 7 <= len(phone) <= 15