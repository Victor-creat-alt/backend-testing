from app import db
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id= db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(20), unique=True, nullable=False)
    password_hash=db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), default='client')
    created_at=db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at=db.Column(db.DateTime(timezone=True), onupdate=func.now())

    cart = db.relationship('Cart', back_populates='user', uselist=False)
    orders = db.relationship('Order', back_populates='user', cascade='all,delete-orphan')
    service_requests=db.relationship('ServiceRequest', back_populates='user', cascade='all,delete-orphan')

    def set_password(self,password):
        self.password_hash = generate_password_hash(password)

    def check_password(self,password):
        return check_password_hash(self.password_hash, password)