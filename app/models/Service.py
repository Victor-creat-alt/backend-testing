from sqlalchemy.sql import func
from app import db

class Service(db.Model):
    __tablename__ = 'services'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    duration = db.Column(db.String(50), nullable=False)  # e.g., "30 minutes"
    image_url = db.Column(db.Text, nullable=False)  # Changed to Text to allow longer data
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    # Relationships                                                                           
    service_requests = db.relationship('ServiceRequest', back_populates='service', lazy=True, cascade='all, delete-orphan')
    order_items = db.relationship('OrderItem', back_populates='service', lazy=True, cascade='all, delete-orphan')
    cart_items = db.relationship('CartItem', back_populates='service', lazy=True, cascade='all, delete-orphan')
