from app import db
from sqlalchemy.sql import func

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.Text, nullable=False)
    discount = db.Column(db.Float, nullable=True, default=0.0)
    category = db.Column(db.String(50), nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False)
    
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    # Line-item relationships
    cart_items = db.relationship('CartItem', back_populates='product', lazy=True, cascade='all, delete-orphan')
    order_items = db.relationship('OrderItem', back_populates='product', lazy=True, cascade='all, delete-orphan')
