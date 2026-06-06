from datetime import datetime
import re

def _validate_date_format(date_str: str) -> bool:
    """Validate date string is YYYY-MM-DD format"""
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False
    
def _validate_city(city: str) -> bool:
    return bool(re.match(r"^[A-Za-z\s\-']+$", city))


def _validate_postal_code(postal_code: str) -> bool:
    return postal_code.isdigit()



def validate_create_complex(data: dict) -> list[str]:
    """
    Validates payload for POST /complexes.
    Requires admin_id to reference an existing complex_admin.
    Returns a list of error strings.
    """
    errors = []

    # ── Required complex fields ───────────────────────────────
    required = ['name', 'address', 'city']
    for field in required:
        if not data.get(field) or not str(data[field]).strip():
            errors.append(f'{field} is required.')

    # ── Name length ───────────────────────────────────────────
    if data.get('name') and len(str(data['name']).strip()) < 2:
        errors.append('name must be at least 2 characters.')

    # ── City validation ──────────────────────────────────────
    if data.get('city'):
        city = str(data['city']).strip()

        if not _validate_city(city):
            errors.append(
                'city must contain only letters, spaces, hyphens, or apostrophes.'
            )


    # ── Postal code validation ───────────────────────────────
    if data.get('postal_code'):
        postal_code = str(data['postal_code']).strip()

        if not _validate_postal_code(postal_code):
            errors.append('postal_code must contain only digits.')

    # ── Campaign dates (optional) ─────────────────────────────
    if data.get('campaign_start_date'):
        if not _validate_date_format(data['campaign_start_date']):
            errors.append('campaign_start_date must be in YYYY-MM-DD format.')

    if data.get('campaign_end_date'):
        if not _validate_date_format(data['campaign_end_date']):
            errors.append('campaign_end_date must be in YYYY-MM-DD format.')

    # ── Campaign date logic ───────────────────────────────────
    if data.get('campaign_start_date') and data.get('campaign_end_date'):
        try:
            start = datetime.strptime(data['campaign_start_date'], '%Y-%m-%d')
            end   = datetime.strptime(data['campaign_end_date'], '%Y-%m-%d')
            if end <= start:
                errors.append('campaign_end_date must be after campaign_start_date.')
        except ValueError:
            pass  # Already caught above

    # ── Admin ID required ─────────────────────────────────────
    if data.get('admin_id') is None:
        errors.append('admin_id is required. Please select a complex admin.')
    else:
        # Ensure it's a valid integer
        try:
            int(data['admin_id'])
        except (ValueError, TypeError):
            errors.append('admin_id must be a valid integer.')

    return errors


def validate_update_complex(data: dict) -> list[str]:
    """
    Validates payload for PUT /complexes/:id.
    All fields optional — only validate what is present.
    """
    errors = []

    if not data:
        errors.append('Request body cannot be empty.')
        return errors

    if 'name' in data and len(str(data['name']).strip()) < 2:
        errors.append('name must be at least 2 characters.')

    # ── City validation ──────────────────────────────────────
    if data.get('city'):
        city = str(data['city']).strip()

        if not _validate_city(city):
            errors.append(
                'city must contain only letters, spaces, hyphens, or apostrophes.'
            )


    # ── Postal code validation ───────────────────────────────
    if data.get('postal_code'):
        postal_code = str(data['postal_code']).strip()

        if not _validate_postal_code(postal_code):
            errors.append('postal_code must contain only digits.')

    if 'campaign_start_date' in data and data['campaign_start_date']:
        if not _validate_date_format(data['campaign_start_date']):
            errors.append('campaign_start_date must be in YYYY-MM-DD format.')

    if 'campaign_end_date' in data and data['campaign_end_date']:
        if not _validate_date_format(data['campaign_end_date']):
            errors.append('campaign_end_date must be in YYYY-MM-DD format.')

    if data.get('campaign_start_date') and data.get('campaign_end_date'):
        try:
            start = datetime.strptime(data['campaign_start_date'], '%Y-%m-%d')
            end   = datetime.strptime(data['campaign_end_date'], '%Y-%m-%d')
            if end <= start:
                errors.append('campaign_end_date must be after campaign_start_date.')
        except ValueError:
            pass

    # ── Admin ID validation (optional on update) ──────────────
    if 'admin_id' in data and data['admin_id']:
        try:
            int(data['admin_id'])
        except (ValueError, TypeError):
            errors.append('admin_id must be a valid integer.')

    return errors