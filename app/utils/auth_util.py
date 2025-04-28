from flask_jwt_extended import get_jwt_identity
from flask import jsonify
from functools import wraps

def admin_required(fn):
    """
    Decorator to restrict access to admin-only routes.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user = get_jwt_identity()
        if not current_user or current_user.get('role') != 'Admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper