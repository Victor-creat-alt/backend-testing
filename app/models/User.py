from sqlalchemy.sql import func
import pyotp  # Import pyotp for generating default TOTP secrets
from werkzeug.security import generate_password_hash, check_password_hash  # Import password hashing functions
from app import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    role = db.Column(db.String(20), default="User")  # "Admin" or "User"
    is_verified = db.Column(db.Boolean, default=False)  # Email verification status
    verification_code = db.Column(db.String(6), nullable=False, default="000000")  # Default value for verification code
    two_fa_secret = db.Column(db.String(32), nullable=False, default=pyotp.random_base32)  # Default TOTP secret key
    is_2fa_enabled = db.Column(db.Boolean, default=False)  # Indicates if 2FA is enabled
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    # Relationships
    orders = db.relationship('Order', back_populates='user', lazy=True, cascade='all, delete-orphan')
    cart = db.relationship('Cart', back_populates='user', uselist=False, lazy=True, cascade='all, delete-orphan')
    service_requests = db.relationship('ServiceRequest', back_populates='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    # Methods for 2FA
    def set_two_fa_secret(self, secret):
        self.two_fa_secret = secret

    def get_two_fa_secret(self):
        return self.two_fa_secret

    def is_two_fa_active(self):
        return self.is_2fa_enabled

    # Method to set the verification code
    def set_verification_code(self, code):
        self.verification_code = code
