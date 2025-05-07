from app import db
from sqlalchemy.sql import func

class Cart(db.Model):
    __tablename__ = 'carts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    total_price = db.Column(db.Float, nullable=False, default=0.0)

    # Relationships
    user = db.relationship('User', back_populates='cart')
    items = db.relationship('CartItem', back_populates='cart', lazy=True, cascade='all, delete-orphan')

    