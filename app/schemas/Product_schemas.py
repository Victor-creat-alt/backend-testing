from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import validates, ValidationError, validate
from app.models.Product import Product  
from app import db 

class ProductSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Product
        load_instance = True
        sqla_session = db.session

    id = auto_field(dump_only=True)

    name = auto_field(
        required=True,
        validate=validate.Length(min=3, max=100, error="Name must be between 3 and 100 characters.")
    )

    description = auto_field(
        validate=validate.Length(max=255, error="Description can't be longer than 255 characters.")
    )

    price = auto_field(required=True)

    category = auto_field(
        required=True,
        validate=validate.OneOf(["medicine", "equipment", "supplement"], error="Invalid category.")
    )

    stock_quantity = auto_field(required=True)

    image_url = auto_field(
        validate=validate.URL(error="Must be a valid URL.")
    )

    created_at = auto_field(dump_only=True)
    #updated_at = auto_field(dump_only=True)

    # Custom validation
    @validates("price")
    def validate_price(self, value):
        if value < 0:
            raise ValidationError("Price must be non-negative.")

    @validates("stock_quantity")
    def validate_stock_quantity(self, value):
        if value < 0:
            raise ValidationError("Stock quantity must be non-negative.")