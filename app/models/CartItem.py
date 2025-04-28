from app import db
from sqlalchemy.sql import func

class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.Datetime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.Datetime(timezone=True), onupdate=func.now())

    #Relationships
    cart = db.relationship('Cart', back_populates='cart_items')
    product = db.relationship('Product', back_populates='cart_items')