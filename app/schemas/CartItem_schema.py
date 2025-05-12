from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import validates, ValidationError, validates_schema
from app.models.CartItem import CartItem
from app import db
from app.schemas.Product_schemas import ProductSchema # Import ProductSchema
from app.schemas.Service_schemas import ServiceSchema # Import ServiceSchema

class CartItemSchema(SQLAlchemyAutoSchema):
    # Nested schemas for product and service details
    product = auto_field(dump_only=True, nested=ProductSchema)
    service = auto_field(dump_only=True, nested=ServiceSchema)

    class Meta:
        model = CartItem
        load_instance = True
        sqla_session = db.session
        # Optionally include foreign keys if needed for loading, but generally not for dumping
        # include_fk = True 

    id = auto_field(dump_only=True)

    # cart_id, product_id, service_id will be auto-generated based on model
    # but we can override if specific validation or load/dump behavior is needed.
    # For loading, product_id or service_id will come from request, cart_id from context.
    cart_id = auto_field(dump_only=True) # Usually set programmatically or via context
    product_id = auto_field(load_only=True, required=False, allow_none=True) # For input
    service_id = auto_field(load_only=True, required=False, allow_none=True) # For input
    
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
        product_id_present = data.get("product_id") is not None
        service_id_present = data.get("service_id") is not None

        if product_id_present and service_id_present:
            raise ValidationError("Cannot provide both product_id and service_id. Choose one.")
        if not product_id_present and not service_id_present:
            raise ValidationError("Either product_id or service_id must be provided.")
