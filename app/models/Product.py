from app import db
from sqlalchemy.sql import func

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False, default=0)
    image_url = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True),server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    #Relationships
    cart_items = db.relationship('CartItem', back_populates='product', cascade='all, delete-orphan')
    order_items = db.relationship('OrderItem', back_populates='product', cascade='all, delete-orphan')