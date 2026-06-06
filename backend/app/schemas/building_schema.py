def validate_create_building(data: dict) -> list[str]:
    """
    Validates payload for POST /buildings.
    Requires admin_id to reference an existing building_admin.
    Returns a list of error strings.
    """
    errors = []

    # ── Required fields ───────────────────────────────────────
    required = ['name', 'address', 'complex_id']
    for field in required:
        if not data.get(field) or not str(data[field]).strip():
            errors.append(f'{field} is required.')

    # ── Name length ───────────────────────────────────────────
    if data.get('name') and len(str(data['name']).strip()) < 2:
        errors.append('name must be at least 2 characters.')

    # ── complex_id must be a positive integer ─────────────────
    if 'complex_id' in data:
        try:
            if int(data['complex_id']) <= 0:
                errors.append('complex_id must be a positive integer.')
        except (ValueError, TypeError):
            errors.append('complex_id must be a valid integer.')

    # ── Optional numeric fields ───────────────────────────────
    if 'floors' in data and data['floors'] is not None:
        try:
            if int(data['floors']) <= 0:
                errors.append('floors must be a positive integer.')
        except (ValueError, TypeError):
            errors.append('floors must be a valid integer.')

    if 'units' in data and data['units'] is not None:
        try:
            if int(data['units']) <= 0:
                errors.append('units must be a positive integer.')
        except (ValueError, TypeError):
            errors.append('units must be a valid integer.')

    # ── Admin ID required ─────────────────────────────────────
    if not data.get('admin_id'):
        errors.append('admin_id is required. Please select a building admin.')
    else:
        try:
            int(data['admin_id'])
        except (ValueError, TypeError):
            errors.append('admin_id must be a valid integer.')

    return errors


def validate_update_building(data: dict) -> list[str]:
    """
    Validates payload for PUT /buildings/:id.
    All fields optional — only validate what is present.
    """
    errors = []

    if not data:
        errors.append('Request body cannot be empty.')
        return errors

    if 'name' in data and len(str(data['name']).strip()) < 2:
        errors.append('name must be at least 2 characters.')

    if 'floors' in data and data['floors'] is not None:
        try:
            if int(data['floors']) <= 0:
                errors.append('floors must be a positive integer.')
        except (ValueError, TypeError):
            errors.append('floors must be a valid integer.')

    if 'units' in data and data['units'] is not None:
        try:
            if int(data['units']) <= 0:
                errors.append('units must be a positive integer.')
        except (ValueError, TypeError):
            errors.append('units must be a valid integer.')

    # ── Admin ID validation (optional on update) ──────────────
    if 'admin_id' in data and data['admin_id']:
        try:
            int(data['admin_id'])
        except (ValueError, TypeError):
            errors.append('admin_id must be a valid integer.')

    return errors