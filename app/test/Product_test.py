import pytest
from app import db
from app.models.User import User
from app.models.Product import Product
from app.models.Order import Order
from app.models.OrderItem import OrderItem
from flask_jwt_extended import create_access_token

@pytest.fixture(scope='function')
def setup_user_product(app):
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
        with db.session.begin_nested():
            order_ids = [order.id for order in Order.query.filter(Order.user.has(User.username.in_(["testuser", "admin", "relationuser"]))).all()]
            if order_ids:
                OrderItem.query.filter(OrderItem.order_id.in_(order_ids)).delete(synchronize_session='fetch')
            Order.query.filter(Order.user.has(User.username.in_(["testuser", "admin", "relationuser"]))).delete(synchronize_session='fetch')
            User.query.filter(User.username.in_(["testuser", "admin", "relationuser"])).delete(synchronize_session='fetch')
            Product.query.filter(Product.name.in_(["Test Product", "Related Product"])).delete(synchronize_session='fetch')
        db.session.commit()

@pytest.fixture
def user_token(user_token):
    return user_token

@pytest.fixture
def admin_token(admin_token):
    return admin_token

def test_create_order(setup_user_product, client, user_token, app):
    with app.app_context():
        product = Product.query.filter_by(name="Test Product").first()
        assert product is not None
        response = client.post('/orders', json={
            "items": [{"product_id": product.id, "quantity": 2, "unit_price": product.price}]
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 201
        assert 'id' in response.json

def test_update_order_status(setup_user_product, client, admin_token, app):
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

def test_order_model_relationships(app):
    with app.app_context():
        # Cleanup before test
        User.query.filter_by(username="relationuser").delete()
        Product.query.filter_by(name="Related Product").delete()
        db.session.commit()

        user = User(username="relationuser", email="relation@example.com", role="User")
        user.set_password("somepassword")
        user.is_verified = True
        db.session.add(user)
        db.session.commit()
        product = Product(name="Related Product", price=25.0, category="misc", stock_quantity=50, image_url="http://example.com/related.jpg")
        db.session.add(product)
        db.session.commit()
        order = Order(user_id=user.id, total_price=50.0, status="pending", delivery_address="456 Oak Ave")
        db.session.add(order)
        db.session.commit()
        order_item = OrderItem(order_id=order.id, product_id=product.id, quantity=2, unit_price=product.price)
        db.session.add(order_item)
        db.session.commit()
        assert hasattr(order, 'user')
        assert hasattr(order, 'items')
