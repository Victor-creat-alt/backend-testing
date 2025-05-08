from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask import jsonify
from functools import wraps
import random
import string

from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask import jsonify
from functools import wraps
import random
import string
from app.models.User import User

def role_required(required_role):
    """
    Decorator to enforce role-based access control
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            current_user = get_jwt_identity()
            user_id = current_user['id']
            user = User.query.get(user_id)
            if not user or user.role != required_role:
                print(f"Access denied for user_id={user_id}, required_role={required_role}, user_role={user.role if user else 'None'}")
                return jsonify({"error": f"{required_role} access required"}), 403
            print(f"Access granted for user_id={user_id}, role={user.role}")
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def generate_verification_code(length=6):
    """
    Generate a random numeric verification code of given length.
    """
    return ''.join(random.choices(string.digits, k=length))

def generate_verification_code(length=6):
    """
    Generate a random numeric verification code of given length.
    """
    return ''.join(random.choices(string.digits, k=length))
