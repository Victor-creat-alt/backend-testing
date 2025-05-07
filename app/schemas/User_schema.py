from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import ValidationError, validate, validates
from app.models.User import User  # Adjust import path if needed
from app import db

class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        sqla_session = db.session
        load_instance = True
        include_fk = False
        ordered = True

    # Fields with validation
    id = auto_field(dump_only=True)

    username = auto_field(
        required=True,
        validate=validate.Length(min=3, max=50),
        error_messages={
            "required": "Username is required.",
            "length": "Username must be between 3 and 50 characters."
        }
    )

    email = auto_field(
        required=True,
        validate=validate.Email(error="Invalid email format."),
        error_messages={
            "required": "Email is required."
        }
    )

    password = auto_field(
        required=True,
        load_only=True,
        validate=validate.Length(min=6),
        error_messages={
            "required": "Password is required.",
            "length": "Password must be at least 6 characters long."
        }
    )

    role = auto_field(
        required=False,
        validate=validate.OneOf(["Admin", "User"]),
        error_messages={
            "one_of": "Role must be either 'Admin' or 'User'."
        }
    )

    created_at = auto_field(dump_only=True)
    # updated_at = auto_field(dump_only=True)

    # Custom validation for uniqueness
    @validates('username')
    def validate_username_unique(self, username):
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            raise ValidationError("A user with this username already exists.")

    @validates('email')
    def validate_email_unique(self, email):
        existing_email = User.query.filter_by(email=email).first()
        if existing_email:
            raise ValidationError("A user with this email already exists.")
