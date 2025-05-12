from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app import db
from app.models.User import User
from app.schemas.User_schema import UserSchema
import jwt
from flask import current_app
from flask_jwt_extended import decode_token
from app.utils.jwt_utils import generate_jwt_token
from app.utils.email_util import send_verification_email
from app.utils.email_util import send_password_reset_email
import random
from app.utils.auth_util import role_required  # Import the decorator
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from flask_restful import Resource, Api
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta

user_bp = Blueprint('user', __name__, url_prefix='/users')
api = Api(user_bp)

user_schema = UserSchema()
users_schema = UserSchema(many=True)

from app.utils.auth_util import role_required  # Import the decorator
from flask_jwt_extended import jwt_required, get_jwt_identity

@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """
    Get a user by ID. Requires JWT authentication.
    """
    from werkzeug.exceptions import NotFound
    try:
        current_user = get_jwt_identity()
        current_user_id = current_user['id']
        user = User.query.get_or_404(user_id)
        if current_user_id != user_id and user.role != 'Admin':
            return {"error": "Access denied. You do not have permission to access this user."}, 403
        return jsonify(user_schema.dump(user)), 200
    except NotFound:
        return {"error": "User not found."}, 404
    except Exception as e:
        return {"error": "An error occurred while fetching the user.", "details": str(e)}, 500

@user_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """
    Update a user by ID. Requires JWT authentication.
    """
    from werkzeug.exceptions import NotFound
    try:
        current_user = get_jwt_identity()
        current_user_id = current_user['id']
        user = User.query.get_or_404(user_id)
        if current_user_id != user_id and user.role != 'Admin':
            return {"error": "Access denied."}, 403
        data = request.get_json()
        try:
            # Pass user_id in context for uniqueness validation
            user_schema.context['user_id'] = user_id
            user_schema.load(data, instance=user, partial=True)
        except ValidationError as err:
            return jsonify({"errors": err.messages}), 400
        db.session.commit()
        return jsonify(user_schema.dump(user)), 200
    except NotFound:
        return {"error": "User not found."}, 404
    except Exception as e:
        return {"error": "An error occurred while updating the user.", "details": str(e)}, 500

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """
    Delete a user by ID. Requires JWT authentication. Allowed for admin or the user themselves.
    """
    current_user = get_jwt_identity()
    current_user_id = current_user['id']
    user = User.query.get_or_404(user_id)
    if current_user_id != user_id and current_user.get('role', '').lower() != 'admin':
        return {"error": "Access denied."}, 403
    db.session.delete(user)
    db.session.commit()
    return {"message": "User deleted successfully."}, 200

class UserListResource(Resource):
    @jwt_required()
    @role_required('Admin') # Secure this endpoint
    def get(self):
        """
        Get a list of all users. (Admin only)
        """
        users = User.query.all()
        return users_schema.dump(users), 200

class PasswordResetRequestResource(Resource):
    def post(self):
        """
        Request password reset. Sends reset email with token.
        """
        data = request.get_json()
        email = data.get("email")

        if not email:
            return {"error": "Email is required."}, 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return {"error": "User with this email does not exist."}, 404

        from flask_jwt_extended import create_access_token
        reset_token = create_access_token(identity=user.id, expires_delta=False)
        try:
            send_password_reset_email(email, reset_token)
        except Exception as e:
            return {"error": f"Failed to send reset email: {str(e)}"}, 500

        return {"message": "Password reset email sent."}, 200

class PasswordResetConfirmResource(Resource):
    def post(self):
        """
        Confirm password reset with token and new password.
        """
        data = request.get_json()
        token = data.get("token")
        new_password = data.get("new_password")

        if not token or not new_password:
            return {"error": "Token and new password are required."}, 400

        try:
            decoded_token = decode_token(token)
            user_id = decoded_token.get('sub')
            if not user_id:
                return {"error": "Invalid or expired token."}, 400
        except Exception:
            return {"error": "Invalid or expired token."}, 400

        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found."}, 404

        user.password = generate_password_hash(new_password)
        db.session.commit()

        return {"message": "Password has been reset successfully."}, 200

api.add_resource(UserListResource, '')
api.add_resource(PasswordResetRequestResource, '/password-reset-request')
api.add_resource(PasswordResetConfirmResource, '/password-reset-confirm')

@user_bp.route('/verify-email', methods=['GET'])
def verify_email():
    """
    Verify email using token query parameter.
    """
    token = request.args.get('token')
    if not token:
        return {"error": "Token is required."}, 400

    # Check if token looks like an email address (simple check)
    if '@' in token:
        return {"error": "Invalid token format. Use OTP verification instead."}, 400

    try:
        decoded_token = decode_token(token)
        user_id = decoded_token.get('sub')
        if not user_id:
            return {"error": "Invalid or expired token."}, 400
    except Exception:
        return {"error": "Invalid or expired token."}, 400

    user = User.query.get(user_id)
    if not user:
        return {"error": "User not found."}, 404

    user.is_verified = True
    db.session.commit()

    return {"message": "Email verified successfully."}, 200
