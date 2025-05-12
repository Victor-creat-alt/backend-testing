from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import validates, ValidationError, validates_schema, post_load
from app.models.CartItem import CartItem
from app import db
from app.schemas.Product_schemas import ProductSchema # Import ProductSchema
from app.schemas.Service_schemas import ServiceSchema # Import ServiceSchema
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CartItemSchema(SQLAlchemyAutoSchema):
    # Nested schemas for product and service details
    product = auto_field(dump_only=True, nested=ProductSchema)
    service = auto_field(dump_only=True, nested=ServiceSchema)

    class Meta:
        model = CartItem
        load_instance = True
        sqla_session = db.session
        # Optionally include foreign keys if needed for loading, but generally not for dumping
        include_fk = True 

    id = auto_field(dump_only=True)

    # cart_id, product_id, service_id will be auto-generated based on model
    # but we can override if specific validation or load/dump behavior is needed.
    # For loading, product_id or service_id will come from request, cart_id from context.
    cart_id = auto_field(required=True) # Changed from dump_only to required
    product_id = auto_field(load_only=True, required=False, allow_none=True) # For input
    service_id = auto_field(load_only=True, required=False, allow_none=True) # For input
    
    quantity = auto_field(required=True)
    created_at = auto_field(dump_only=True)
    
    # custom validation
    @validates("quantity")
    def validate_quantity(self, value):
        logger.info(f"Validating quantity: {value}")
        if value <= 0:
            logger.error(f"Invalid quantity: {value}")
            raise ValidationError("Quantity must be a positive integer.")
        return value

    @validates("cart_id")
    def validate_cart_id(self, value):
        logger.info(f"Validating cart_id: {value}")
        if value <= 0:
            logger.error(f"Invalid cart_id: {value}")
            raise ValidationError("Cart ID must be a positive integer.")
        return value

    @validates_schema
    def validate_product_or_service(self, data, **kwargs):
        logger.info(f"Validating product_or_service with data: {data}")
        product_id_present = data.get("product_id") is not None
        service_id_present = data.get("service_id") is not None

        if product_id_present and service_id_present:
            logger.error("Both product_id and service_id provided")
            raise ValidationError("Cannot provide both product_id and service_id. Choose one.")
        if not product_id_present and not service_id_present:
            logger.error("Neither product_id nor service_id provided")
            raise ValidationError("Either product_id or service_id must be provided.")
        
        # Verify that the product or service exists
        if product_id_present:
            from app.models.Product import Product
            product = Product.query.get(data["product_id"])
            if not product:
                logger.error(f"Product with ID {data['product_id']} not found")
                raise ValidationError(f"Product with ID {data['product_id']} not found")
            
        if service_id_present:
            from app.models.Service import Service
            service = Service.query.get(data["service_id"])
            if not service:
                logger.error(f"Service with ID {data['service_id']} not found")
                raise ValidationError(f"Service with ID {data['service_id']} not found")

    @post_load
    def log_loaded_data(self, data, **kwargs):
        logger.info(f"Successfully loaded cart item: {data}")
        return data
