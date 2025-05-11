from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from marshmallow import validates, ValidationError, fields
from app.models.Service_request import ServiceRequest
from app import db
import datetime

class ServiceRequestSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ServiceRequest
        load_instance = True
        sqla_session = db.session

    id = auto_field(dump_only=True)
    user_id = auto_field(dump_only=True)  # make dump_only so not required in input
    service_id = auto_field(required=True)
    status = auto_field()  # optional on input
    appointment_time = fields.DateTime(required=True, format='iso')
    created_at = auto_field(dump_only=True)
    # updated_at = auto_field(dump_only=True)

    @validates("status")
    def validate_status(self, value):
        allowed = ["pending", "confirmed", "completed", "cancelled"]
        if value not in allowed:
            raise ValidationError(f"Status must be one of: {', '.join(allowed)}.")

    @validates("appointment_time")
    def validate_appointment_time(self, value):
        # Handle naive datetime by assuming UTC
        if value.tzinfo is None or value.tzinfo.utcoffset(value) is None:
            value = value.replace(tzinfo=datetime.timezone.utc)
        # Allow appointment_time to be at least current time (not strictly in future)
        if value < datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(seconds=1):
            raise ValidationError("Appointment time must be in the future.")
