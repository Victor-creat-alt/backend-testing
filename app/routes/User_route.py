from flask import Blueprint, request, jsonify, current_app
from flask_restful import Api, Resource
from marshmallow import ValidationError
from app import db
from app.models.User import User
from app.schemas.User_schema import UserSchema
from app.utils.jwt_utils import generate_jwt_token
from app.utils.email_util import send_verification_email, send_password_reset_email
import pyotp
import qrcode
from io import BytesIO
import base64
from app.utils.auth_util import role_required # Import the decorator
from flask_jwt_extended import jwt_required, get_jwt_identity

user_bp = Blueprint('user', __name__, url_prefix='/users')
api = Api(user_bp)

user_schema = UserSchema()
users_schema = UserSchema(many=True)

class UserResource(Resource):
    @role_required("Admin")
    def get(self, user_id):
        user = db.session.get(User, user_id)
        if user is None:
            return {"error": "User not found"}, 404
        return user_schema.dump(user), 200

    @role_required("Admin")
    def put(self, user_id):
        user = db.session.get(User, user_id)
        if user is None:
            return {"error": "User not found"}, 404
        data = request.get_json()
        try:
            user_schema.load(data, instance=user, partial=False)
        except ValidationError as err:
            return {"errors": err.messages}, 400
        db.session.commit()
        return user_schema.dump(user), 200

    @role_required("Admin")
    def delete(self, user_id):
        user = db.session.get(User, user_id)
        if user is None:
            return {"error": "User not found"}, 404
        db.session.delete(user)
        db.session.commit()
        return {}, 204

class UserListResource(Resource):
    @role_required("Admin")
    def get(self):
        users = User.query.all()
        return users_schema.dump(users), 200

    def post(self):
        data = request.get_json()

        # Map 'name' to 'username' for schema compatibility
        if 'name' in data:
            data['username'] = data.pop('name')

        # Enforce role as 'User' for client registration only
        if 'role' in data and data['role'] != 'User':
            return {"error": "Registration is only allowed for clients."}, 403
        data['role'] = 'User'

        try:
            user = user_schema.load(data)
        except ValidationError as err:
            return {"errors": err.messages}, 400

        user.set_password(data.get("password"))
        db.session.add(user)
        db.session.commit()

        # Generate verification token and send verification email with link button
        import jwt
        from datetime import datetime, timedelta

        payload = {
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
        try:
            send_verification_email(user.email, token)
        except Exception as e:
            current_app.logger.error(f"Error sending verification email: {e}")
            db.session.rollback()
            return {'error': 'Failed to send verification email. Please check your email configuration and try again.'}, 500

        return {"message": "Registration successful. Please check your email to verify your account."}, 201

class Enable2FAResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()['id']
        user = db.session.get(User, user_id)

        # Generate a unique secret key for TOTP
        secret_key = pyotp.random_base32()
        user.set_two_fa_secret(secret_key)
        user.is_2fa_enabled = True
        db.session.commit()

        # Generate the provisioning URI for the QR code
        provisioning_uri = pyotp.TOTP(secret_key).provisioning_uri(
            name=user.email, issuer_name="Vetty App Backend"  # Replace with your app name
        )

        # Generate QR code as a base64 encoded image
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, "PNG")
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return jsonify({
            "message": "Two-factor authentication enabled. Scan the QR code in your authenticator app.",
            "qr_code": qr_code_base64,
            "secret_key": secret_key  # Consider if you want to expose this directly
        }), 200

    @jwt_required()
    def delete(self):
        user_id = get_jwt_identity()['id']
        user = db.session.get(User, user_id)
        user.is_2fa_enabled = False
        user.two_fa_secret = None
        db.session.commit()
        return {"message": "Two-factor authentication disabled."}, 200

class Verify2FACodeResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()['id']
        user = db.session.get(User, user_id)
        data = request.get_json()
        token = data.get("token")

        if not user.is_two_fa_active() or not user.get_two_fa_secret():
            return {"error": "Two-factor authentication is not enabled for this user."}, 400

        totp = pyotp.TOTP(user.get_two_fa_secret())
        if totp.verify(token):
            return {"message": "Two-factor code verified successfully."}, 200
        else:
            return {"error": "Invalid two-factor code."}, 401

class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        token_2fa = data.get("token_2fa")  # Optional 2FA token

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return {"error": "Invalid credentials."}, 401

        if not user.is_verified:
            return {"error": "Email not verified. Please verify your email before logging in."}, 403

        if user.is_two_fa_active():
            if not token_2fa:
                return {"message": "Two-factor code required."}, 401
            totp = pyotp.TOTP(user.get_two_fa_secret())
            if not totp.verify(token_2fa):
                return {"error": "Invalid two-factor code."}, 401

        access_token, refresh_token = generate_jwt_token(user)
        return {"access_token": access_token, "refresh_token": refresh_token}, 200

api.add_resource(UserListResource, '')
api.add_resource(UserResource, '/<int:user_id>')
api.add_resource(Enable2FAResource, '/enable-2fa')

class Disable2FAResource(Resource):
    @jwt_required()
    def delete(self):
        user_id = get_jwt_identity()['id']
        user = db.session.get(User, user_id)
        user.is_2fa_enabled = False
        user.two_fa_secret = None
        db.session.commit()
        return {"message": "Two-factor authentication disabled."}, 200

api.add_resource(Disable2FAResource, '/disable-2fa')
api.add_resource(Verify2FACodeResource, '/verify-2fa')
api.add_resource(LoginResource, '/login')

from flask import request
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from flask import current_app

class VerifyEmailResource(Resource):
    def get(self):
        token = request.args.get('token')
        if not token:
            return {"error": "Token is required."}, 400

        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            email = payload.get('email')
            if not email:
                return {"error": "Invalid token payload."}, 400

            user = User.query.filter_by(email=email).first()
            if not user:
                return {"error": "User not found."}, 404

            if user.is_verified:
                return {"message": "User already verified."}, 200

            user.is_verified = True
            db.session.commit()
            return {"message": "Email verified successfully."}, 200

        except ExpiredSignatureError:
            return {"error": "Verification token has expired."}, 400
        except InvalidTokenError:
            return {"error": "Invalid verification token."}, 400
        except Exception as e:
            current_app.logger.error(f"Error during email verification: {e}")
            return {"error": f"An error occurred during email verification: {str(e)}"}, 500

api.add_resource(VerifyEmailResource, '/verify-email')

class ResetPasswordResource(Resource):
    def post(self):
        data = request.get_json()
        new_password = data.get("newPassword")
        token = data.get("token")

        if not token:
            return {"error": "Token is required."}, 400
        if not new_password:
            return {"error": "New password is required."}, 400

        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            email = payload.get('email')
            if not email:
                return {"error": "Invalid token payload."}, 400

            user = User.query.filter_by(email=email).first()
            if not user:
                return {"error": "User not found."}, 404

            user.set_password(new_password)
            db.session.commit()
            return {"message": "Password reset successful."}, 200

        except ExpiredSignatureError:
            return {"error": "Password reset token has expired."}, 400
        except InvalidTokenError:
            return {"error": "Invalid password reset token."}, 400
        except Exception as e:
            current_app.logger.error(f"Error during password reset: {e}")
            return {"error": f"An error occurred during password reset: {str(e)}"}, 500

from flask import request
import jwt
from datetime import datetime, timedelta
from flask import current_app

class PasswordResetRequestResource(Resource):
    def post(self):
        data = request.get_json()
        email = data.get("email")
        if not email:
            return {"error": "Email is required."}, 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return {"error": "User with this email does not exist."}, 404

        payload = {
            'email': email,
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

        try:
            send_password_reset_email(email, token)
        except Exception as e:
            current_app.logger.error(f"Error sending password reset email: {str(e)}")
            return {"error": "Failed to send password reset email."}, 500

        return {"message": "Password reset email sent. Please check your email."}, 200

api.add_resource(PasswordResetRequestResource, '/request-password-reset')
api.add_resource(ResetPasswordResource, '/reset-password')