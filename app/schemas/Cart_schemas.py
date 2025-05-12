from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import validates, ValidationError
from app.models.Cart import Cart
from app import db  

class CartSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Cart
        load_instance = True
        sqla_session = db.session

    id = auto_field(dump_only=True)

    user_id = auto_field(required=True) # Typically dump_only if set from JWT, or validated if loaded
    total_price = auto_field(dump_only=True) # Calculated, so usually dump_only
    created_at = auto_field(dump_only=True)

    #custom validation
    @validates("user_id")
    def validate_user_id(self, value):
        if value <= 0:
            raise ValidationError("User ID must be a positive integer.")
