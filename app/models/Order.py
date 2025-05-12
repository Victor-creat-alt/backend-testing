from app import db
from sqlalchemy.sql import func

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_price = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(50), nullable=False)
    
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = db.relationship('User', back_populates='orders')
    items = db.relationship('OrderItem', back_populates='order', lazy=True, cascade='all, delete-orphan')
    # Relationships
    payment = db.relationship('Payment', back_populates='order', uselist=False, cascade='all, delete-orphan')  # One-to-one relationship
