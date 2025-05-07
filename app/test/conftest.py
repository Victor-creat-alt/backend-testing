import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import pytest
from app import create_app, db

@pytest.fixture(scope='session')
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.app_context():
        # Import all models to register them with SQLAlchemy before creating tables
        from app import models
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

import datetime
from flask_jwt_extended import create_access_token
from app.models.User import User
from app.models.Product import Product
from app.models.Order import Order
from app import db

@pytest.fixture(scope='session')
def client(app):
    return app.test_client()

@pytest.fixture(scope='function')
def user_id(app):
    with app.app_context():
        user = User.query.filter_by(username="testuser").first()
        if not user:
            user = User(username="testuser", email="testuser@example.com", role="User")
            user.set_password("password123")
            db.session.add(user)
            db.session.commit()
        return user.id

@pytest.fixture(scope='function')
def user_token(app, user_id):
    with app.app_context():
        user = db.session.get(User, user_id)
        token = create_access_token(identity={"id": user.id, "role": user.role})
        return token

@pytest.fixture(scope='function')
def admin_id(app):
    with app.app_context():
        admin = User.query.filter_by(email="admin@example.com").first()
        if admin:
            db.session.delete(admin)
            db.session.commit()
        admin = User(username="adminuser", email="admin@example.com", role="Admin")
        admin.set_password("adminpassword")
        db.session.add(admin)
        db.session.commit()
        return admin.id

@pytest.fixture(scope='function')
def admin_token(app, admin_id):
    with app.app_context():
        admin = db.session.get(User, admin_id)
        token = create_access_token(identity={"id": admin.id, "role": admin.role})
        return token

@pytest.fixture(scope='function')
def product_id(app):
    with app.app_context():
        product = Product.query.filter_by(name="Test Product").first()
        if not product:
            product = Product(name="Test Product", description="Test product description", price=10.0, image_url="http://example.com/product.jpg")
            db.session.add(product)
            db.session.commit()
        return product.id

@pytest.fixture(scope='function')
def order_id(app, user_id, product_id):
    with app.app_context():
        order = Order.query.filter_by(user_id=user_id).first()
        if not order:
            order = Order(user_id=user_id, total_price=10.0, status="pending", delivery_address="123 Main St")
            db.session.add(order)
            db.session.commit()
        return order.id
