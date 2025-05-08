from app import db
from sqlalchemy.sql import func

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, unique=True)  # Add ForeignKey
    payment_method = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    transaction_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    # Relationships
    order = db.relationship('Order', back_populates='payment')  # Define relationship
