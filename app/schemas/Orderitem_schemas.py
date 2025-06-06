from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import validates, ValidationError, validates_schema # Added validates_schema
from app.models.OrderItem import OrderItem
from app.schemas.Product_schemas import ProductSchema
from app import db  

class OrderItemSchema(SQLAlchemyAutoSchema):
    product = auto_field(dump_only=True, nested=ProductSchema)
    # To nest service details if needed:
    # from app.schemas.Service_schemas import ServiceSchema
    # service = auto_field(dump_only=True, nested=ServiceSchema)

    class Meta:
        model = OrderItem
        load_instance = True
        sqla_session = db.session

    id = auto_field(dump_only=True)
    order_id = auto_field(required=True)
    product_id = auto_field()
    service_id = auto_field()
    quantity = auto_field(required=True)
    unit_price = auto_field(required=True)
    created_at = auto_field(dump_only=True)
   # custom validation
    @validates("order_id")
    def validate_order_id(self, value):
        if value <= 0:
            raise ValidationError("Order ID must be a positive integer.")

    @validates("quantity")
    def validate_quantity(self, value):
        if value <= 0:
            raise ValidationError("Quantity must be greater than 0.")

    @validates("unit_price")
    def validate_unit_price(self, value):
        if value < 0:
            raise ValidationError("Unit price must be a non-negative number.")

    @validates_schema
    def validate_product_or_service(self, data, **kwargs):
        product_id_present = data.get("product_id") is not None
        service_id_present = data.get("service_id") is not None

        if product_id_present and service_id_present:
            raise ValidationError("Cannot provide both product_id and service_id. Choose one.")
        if not product_id_present and not service_id_present:
            raise ValidationError("Either product_id or service_id must be provided.")
