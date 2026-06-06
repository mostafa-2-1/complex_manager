
from flask import jsonify


def success_response(message: str, data=None, status_code: int = 200):
    """
    Standard success response.

    Shape:
    {
        "success": true,
        "message": "...",
        "data": { ... } or [ ... ] or null
    }
    """
    return jsonify({
        'success': True,
        'message': message,
        'data':    data
    }), status_code


def error_response(message: str, status_code: int = 400):
    """
    Standard error response.

    Shape:
    {
        "success": false,
        "message": "...",
        "data": null
    }
    """
    return jsonify({
        'success': False,
        'message': message,
        'data':    None
    }), status_code


def paginated_response(message: str, items: list, pagination):
    """
    Standard paginated list response.

    Shape:
    {
        "success": true,
        "message": "...",
        "data": {
            "items": [ ... ],
            "pagination": {
                "total":    45,
                "pages":    5,
                "page":     1,
                "per_page": 10,
                "has_next": true,
                "has_prev": false
            }
        }
    }
    """
    return jsonify({
        'success': True,
        'message': message,
        'data': {
            'items': items,
            'pagination': {
                'total':    pagination.total,
                'pages':    pagination.pages,
                'page':     pagination.page,
                'per_page': pagination.per_page,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev,
            }
        }
    }), 200