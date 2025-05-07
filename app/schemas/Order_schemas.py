from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import validates, ValidationError
from app.models.Order import Order
from app import db  
class OrderSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Order
        load_instance = True
        sqla_session = db.session

    id = auto_field(dump_only=True)
    user_id = auto_field(required=True)
    total_price = auto_field(required=True)
    status = auto_field(required=True)
    created_at = auto_field(dump_only=True)
    #updated_at = auto_field(dump_only=True)


    # custom validation
    @validates("user_id")
    def validate_user_id(self, value):
        if value <= 0:
            raise ValidationError("User ID must be a positive integer.")

    @validates("total_price")
    def validate_total_price(self, value):
        if value < 0:
            raise ValidationError("Total price must be a non-negative number.")

    @validates("status")
    def validate_status(self, value):
        allowed_statuses = {"pending", "paid", "shipped", "completed", "cancelled"}
        if value.lower() not in allowed_statuses:
            raise ValidationError(f"Status must be one of {allowed_statuses}.")