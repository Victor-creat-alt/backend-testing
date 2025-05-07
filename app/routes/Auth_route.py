from flask import Blueprint, request, jsonify
from app.models import User
from app import db
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, create_refresh_token
)
from datetime import timedelta
from app.utils.email_util import send_verification_email  # Import the corrected email utility
from app.utils.auth_util import generate_verification_code
import pyotp

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'User')

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'error': 'Username or email already exists'}), 400

    verification_code = generate_verification_code()  # Generate a 6-digit verification code
    two_fa_secret = pyotp.random_base32()  # Generate a default TOTP secret key

    new_user = User(
        username=username,
        email=email,
        role=role,
        is_verified=False,
        two_fa_secret=two_fa_secret,
        is_2fa_enabled=False
    )
    new_user.set_password(password)
    new_user.set_verification_code(verification_code)  # Set the actual verification code
    db.session.add(new_user)
    db.session.commit()

    try:
        send_verification_email(email, verification_code)  # Send the verification email
    except Exception as e:
        print(f"Error sending verification email: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to send verification email. Please check your email configuration and try again.'}), 500

    return jsonify({'message': 'User created successfully. Please check your email to verify your account.'}), 201

@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.is_verified:
        return jsonify({'message': 'User already verified'}), 200

    if user.verification_code == code:
        user.is_verified = True
        user.set_verification_code("000000")  # Reset the verification code to the default value
        db.session.commit()
        return jsonify({'message': 'Email verified successfully.'}), 200
    else:
        return jsonify({'error': 'Invalid verification code'}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')  # Ensure this is being retrieved correctly

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):  # Pass the plain-text password here
        if not user.is_verified:
            return jsonify({'error': 'Email not verified. Please verify your email before logging in.'}), 403
        access_token = create_access_token(identity={'id': user.id, 'role': user.role}, expires_delta=timedelta(hours=48))
        refresh_token = create_refresh_token(identity={'id': user.id, 'role': user.role})
        return jsonify({'access_token': access_token, 'refresh_token': refresh_token}), 200

    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/auto-login', methods=['GET'])
@jwt_required()
def auto_login():
    identity = get_jwt_identity()
    return jsonify({'user': identity}), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logout handled client-side by removing token'}), 200