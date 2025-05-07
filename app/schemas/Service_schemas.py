from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import validates, ValidationError
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
    created_at = auto_field(dump_only=True)
    #updated_at = auto_field(dump_only=True)
#custom validation
    @validates("name")
    def validate_name(self, value):
        if not value.strip():
            raise ValidationError("Service name cannot be blank.")
        if len(value) > 100:
            raise ValidationError("Service name must be under 100 characters.")

    @validates("price")
    def validate_price(self, value):
        if value < 0:
            raise ValidationError("Price must be a non-negative number.")