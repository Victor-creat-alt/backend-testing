from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import validates, ValidationError, validates_schema
from app.models.CartItem import CartItem
from app import db  

class CartItemSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = CartItem
        load_instance = True
        sqla_session = db.session

    id = auto_field(dump_only=True)

    cart_id = auto_field(required=True)
    product_id = auto_field()
    service_id = auto_field()
    quantity = auto_field(required=True)
    created_at = auto_field(dump_only=True)
    
    # custom validation
    @validates("quantity")
    def validate_quantity(self, value):
        if value <= 0:
            raise ValidationError("Quantity must be a positive integer.")

    @validates("cart_id")
    def validate_cart_id(self, value):
        if value <= 0:
            raise ValidationError("Cart ID must be a positive integer.")

    @validates_schema
    def validate_product_or_service(self, data, **kwargs):
        if not data.get("product_id") and not data.get("service_id"):
            raise ValidationError("Either product_id or service_id must be provided.")