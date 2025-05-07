from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import validates, ValidationError
from app.models.Payment import Payment
from app import db  

class PaymentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Payment
        load_instance = True
        sqla_session = db.session

    id = auto_field(dump_only=True)
    order_id = auto_field(required=True)
    payment_method = auto_field(required=True)
    amount = auto_field(required=True)
    status = auto_field(required=True)
    created_at = auto_field(dump_only=True)
   
   # Custom validation
    @validates("order_id")
    def validate_order_id(self, value):
        if value <= 0:
            raise ValidationError("Order ID must be a positive integer.")

    @validates("payment_method")
    def validate_payment_method(self, value):
        allowed_methods = ["credit_card", "paypal", "bank_transfer", "cash", "crypto",'mobile_payment',"m-pesa"]
        if value not in allowed_methods:
            raise ValidationError(f"Payment method must be one of: {', '.join(allowed_methods)}.")

    @validates("amount")
    def validate_amount(self, value):
        if value < 0:
            raise ValidationError("Payment amount must be non-negative.")

    @validates("status")
    def validate_status(self, value):
        allowed_statuses = ["pending", "completed", "failed", "refunded", "canceled", "processing"]
        if value not in allowed_statuses:
            raise ValidationError(f"Status must be one of: {', '.join(allowed_statuses)}.")