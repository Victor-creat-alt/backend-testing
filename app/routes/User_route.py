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

# Temporary store for OTPs (for initial email verification)
otp_store = {}

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
    def get(self):
        """
        Get a list of all users.
        """
        users = User.query.all()
        return users_schema.dump(users), 200

    def post(self):
        """
        Create a new user. Sends a verification email.
        """
        data = request.get_json()
        # Map 'name' field to 'username' to align with frontend
        if 'name' in data:
            data['username'] = data.pop('name')
        # Log incoming data
        try:
            user = user_schema.load(data)
        except ValidationError as err:
            print(f"Validation errors: {err.messages}")  # Log validation errors
            return {"errors": err.messages}, 400

        # Hash the password before saving
        user.set_password(user.password)

        db.session.add(user)
        db.session.commit()

        # Generate OTP and send verification email
        otp = random.randint(100000, 999999)
        otp_store[user.email] = otp
        send_verification_email(user.email, otp)

        return {"message": "User created. Verification email sent."}, 201

class VerifyOTPResource(Resource):
    def post(self):
        """
        Verify OTP for email verification.
        """
        data = request.get_json()
        email = data.get("email")
        otp = data.get("otp")

        if not email or not otp:
            return {"error": "Email and OTP are required."}, 400

        if email in otp_store and str(otp) == str(otp_store[email]):
            user = User.query.filter_by(email=email).first()
            if user:
                user.is_verified = True
                db.session.commit()
                del otp_store[email]
                return {"message": "Email verified successfully."}, 200
            return {"error": "User not found for this email."}, 404
        return {"error": "Invalid OTP or email."}, 400

class UserResource(Resource):
    @jwt_required()
    def get(self, user_id):
        """
        Get a user by ID.
        """
        current_user = get_jwt_identity()
        current_user_id = current_user['id']
        if current_user_id != user_id:
            return {"error": "Access denied."}, 403
        user = User.query.get_or_404(user_id)
        return user_schema.dump(user), 200

    @jwt_required()
    def put(self, user_id):
        """
        Update a user by ID.
        """
        current_user = get_jwt_identity()
        current_user_id = current_user['id']
        if current_user_id != user_id:
            return {"error": "Access denied."}, 403
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        try:
            user_schema.load(data, instance=user, partial=True)
        except ValidationError as err:
            return {"errors": err.messages}, 400
        db.session.commit()
        return user_schema.dump(user), 200

    @jwt_required()
    @role_required('admin')
    def delete(self, user_id):
        """
        Delete a user by ID. Admin only.
        """
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return '', 204

class UserLoginResource(Resource):
    def post(self):
        """
        User login endpoint. Returns JWT token on success.
        """
        try:
            data = request.get_json()
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return {"error": "Email and password are required."}, 400

            user = User.query.filter_by(email=email).first()
            if not user or not check_password_hash(user.password, password):
                return {"error": "Invalid email or password."}, 401

            from app.utils.jwt_utils import generate_jwt_token
            access_token, refresh_token = generate_jwt_token(user)
            return {"access_token": access_token, "refresh_token": refresh_token}, 200

        except Exception as e:
            print(f"Error during login: {e}")
            return {"error": "An internal error occurred during login."}, 500

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
            user_id = decoded_token.get('sub', {}).get('id')
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
api.add_resource(UserResource, '/<int:user_id>')
api.add_resource(VerifyOTPResource, '/verify-otp')
api.add_resource(UserLoginResource, '/login')
api.add_resource(PasswordResetRequestResource, '/password-reset-request')
api.add_resource(PasswordResetConfirmResource, '/password-reset-confirm')
