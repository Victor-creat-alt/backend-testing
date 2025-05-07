import pytest
from app import db
from app.models.User import User
from app.models.Product import Product
from app.models.Order import Order
from app.schemas.Order_schemas import OrderSchema
from marshmallow import ValidationError
from flask_jwt_extended import create_access_token
from app.models.OrderItem import OrderItem
from app.models.Payment import Payment
from app.models.Service_request import ServiceRequest
from app.models.Cart import Cart

@pytest.fixture(scope='function')
def setup_test_data(app):
    with app.app_context():
        user = User.query.filter_by(username="testuser").first()
        if not user:
            user = User(username="testuser", email="testuser@example.com", role="User")
            user.set_password("password123")
            user.is_verified = True
            db.session.add(user)

        admin = User.query.filter_by(email="admin@example.com").first()
        if not admin:
            admin = User(username="admin", email="admin@example.com", role="Admin")
            admin.set_password("admin123")
            admin.is_verified = True
            db.session.add(admin)

        product = Product.query.filter_by(name="Test Product").first()
        if not product:
            product = Product(name="Test Product", price=10.0, category="medicine", stock_quantity=100, image_url="http://example.com/image.jpg")
            db.session.add(product)

        db.session.commit()
        yield
        # Cleanup after test
        with app.app_context():
            user = User.query.filter_by(username="testuser").first()
            if user:
                # Delete dependent records individually
                order_items = OrderItem.query.join(Order).filter(Order.user_id == user.id).all()
                for item in order_items:
                    db.session.delete(item)
                payments = Payment.query.join(Order).filter(Order.user_id == user.id).all()
                for payment in payments:
                    db.session.delete(payment)
                orders = Order.query.filter_by(user_id=user.id).all()
                for order in orders:
                    db.session.delete(order)
                service_requests = ServiceRequest.query.filter_by(user_id=user.id).all()
                for sr in service_requests:
                    db.session.delete(sr)
                carts = Cart.query.filter_by(user_id=user.id).all()
                for cart in carts:
                    db.session.delete(cart)
                db.session.commit()
                db.session.delete(user)
                db.session.commit()

            Product.query.filter_by(name="Test Product").delete()
            db.session.commit()

@pytest.fixture
def user_token(user_token):
    return user_token

@pytest.fixture
def admin_token(admin_token):
    return admin_token

def test_get_orders(client, user_token, app):
    response = client.get('/orders', headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_create_order(setup_test_data, client, user_token, app):
    with app.app_context():
        product = Product.query.filter_by(name="Test Product").first()
        assert product is not None
        response = client.post('/orders', json={
            "items": [{"product_id": product.id, "quantity": 2, "unit_price": product.price}]
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 201
        assert 'id' in response.json

def test_update_order_status(setup_test_data, client, admin_token, app):
    with app.app_context():
        user = User.query.filter_by(username="testuser").first()
        assert user is not None
        order = Order(user_id=user.id, total_price=100.0, status="pending", delivery_address="123 Main St")
        db.session.add(order)
        db.session.commit()
        order_id = order.id

    response = client.put(
        f'/orders/{order_id}/status',
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert response.json['message'] == 'Order status updated successfully'

def test_order_schema_valid_data(app):
    order_data = {
        "user_id": 1,
        "total_price": 50.0,
        "status": "pending",
        "delivery_address": "123 Main St"
    }
    with app.app_context():
        schema = OrderSchema()
        order = schema.load(order_data)
        assert order.user_id == 1
        assert order.status == "pending"

def test_order_schema_invalid_status(app):
    order_data = {
        "user_id": 1,
        "total_price": 50.0,
        "status": "invalid_status",
        "delivery_address": "123 Main St"
    }
    with app.app_context():
        schema = OrderSchema()
        with pytest.raises(ValidationError):
            schema.load(order_data)

def test_order_model_relationships(app):
    with app.app_context():
        user = User(username="relationuser", email="relation@example.com", role="User")
        user.set_password("somepassword")
        user.is_verified = True
        db.session.add(user)
        db.session.commit()
        order = Order(user_id=user.id, total_price=100.0, status="pending", delivery_address="123 Main St")
        db.session.add(order)
        db.session.commit()
        assert hasattr(order, 'user')
        assert hasattr(order, 'items')
        assert hasattr(order, 'payment')

def test_order_schema_invalid_total_price(app):
    order_data = {
        "user_id": 1,
        "total_price": "not_a_float",
        "status": "pending",
        "delivery_address": "123 Main St"
    }
    with app.app_context():
        schema = OrderSchema()
        with pytest.raises(ValidationError):
            schema.load(order_data)
