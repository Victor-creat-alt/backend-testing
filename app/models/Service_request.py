from sqlalchemy.sql import func
from app import db

class ServiceRequest(db.Model):
    __tablename__ = 'service_requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    appointment_time = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = db.relationship('User', back_populates='service_requests')
    service = db.relationship('Service', back_populates='service_requests')