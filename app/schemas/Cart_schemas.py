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

    user_id = auto_field(required=True)

    created_at = auto_field(dump_only=True)

    #custom validation
    @validates("user_id")
    def validate_user_id(self, value):
        if value <= 0:
            raise ValidationError("User ID must be a positive integer.")