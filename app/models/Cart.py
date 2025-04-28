from app import db
from sqlalchemy.sql import func

class Cart(db.Model):
    __tablename__ = 'carts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    #A cart belongs to a user
    user = db.relationship('User', back_populates='cart')
    #A cart can have many items
    cart_items = db.relationship('CartItem', back_populates='cart', cascade='all, delete-orphan')