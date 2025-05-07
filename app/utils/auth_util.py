from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask import jsonify
from functools import wraps
import random
import string

def role_required(required_role):
    """
    Decorator to enforce role-based access control
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            current_user = get_jwt_identity()
            if current_user['role'] != required_role:
                return jsonify({"error": f"{required_role} access required"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def generate_verification_code(length=6):
    """
    Generate a random numeric verification code of given length.
    """
    return ''.join(random.choices(string.digits, k=length))
