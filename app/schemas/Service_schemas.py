from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import validates, ValidationError, fields, validate # Added validate
from app.models.Service import Service
from app import db  

class ServiceSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Service
        load_instance = True
        sqla_session = db.session

    id = auto_field(dump_only=True)
    name = auto_field(required=True)
    description = auto_field()
    price = auto_field(required=True)
    duration = fields.String(required=True)  # Changed from Integer to String
    image_url = fields.String(
        required=True,
        validate=validate.URL(error="Must be a valid URL.")
    )

    created_at = auto_field(dump_only=True)
    #updated_at = auto_field(dump_only=True)

    #custom validation
    @validates("name")
    def validate_name(self, value):
        if not value.strip():
            raise ValidationError("Service name cannot be blank.")
        if len(value) > 255: # Aligned with model String(255)
            raise ValidationError("Service name must be under 255 characters.")

    @validates("price")
    def validate_price(self, value):
        if value < 0:
            raise ValidationError("Price must be a non-negative number.")
