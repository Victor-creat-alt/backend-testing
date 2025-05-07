import pytest
from app import db
from app.models.User import User
from app.models.Product import Product
from app.models.Cart import Cart
from app.models.CartItem import CartItem
from flask_jwt_extended import create_access_token

@pytest.fixture
def admin_id(app):
    with app.app_context():
        admin = User.query.filter_by(email="admin@example.com").first()
        if admin:
            db.session.delete(admin)
            db.session.commit()
        admin = User(username="admin", email="admin@example.com", role="Admin")
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()
        return admin.id

@pytest.fixture
def admin_token(app, admin_id):
    with app.app_context():
        admin = db.session.get(User, admin_id)
        token = create_access_token(identity={"id": admin.id, "role": admin.role})
        return token

def test_get_cart(client, admin_id, admin_token, app):
    with app.app_context():
        cart = Cart.query.filter_by(user_id=admin_id).first()
        if not cart:
            cart = Cart(user_id=admin_id)
            db.session.add(cart)
            db.session.commit()
    response = client.get('/cart', headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200

def test_add_item_to_cart(client, admin_id, admin_token, app):
    with app.app_context():
        product = Product.query.filter_by(name="Dog Toy").first()
        if not product:
            product = Product(name="Dog Toy", price=15.0, stock_quantity=20, category="Toys", image_url="http://example.com/dogtoy.jpg")
            db.session.add(product)
            db.session.commit()

        response = client.post('/cart/items', json={
            "product_id": product.id,
            "quantity": 2
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 201
        assert 'id' in response.json  # Changed from 'item_id' to 'id'

def test_update_cart_item_quantity(client, admin_id, admin_token, app):
    with app.app_context():
        cart = Cart.query.filter_by(user_id=admin_id).first()
        if not cart:
            cart = Cart(user_id=admin_id)
            db.session.add(cart)
            db.session.commit()

        product = Product.query.filter_by(name="Cat Food").first()
        if not product:
            product = Product(name="Cat Food", price=10.0, stock_quantity=30, category="Food", image_url="http://example.com/catfood.jpg")
            db.session.add(product)
            db.session.commit()

        cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product.id).first()
        if not cart_item:
            cart_item = CartItem(cart_id=cart.id, product_id=product.id, quantity=1)
            db.session.add(cart_item)
            db.session.commit()

        response = client.put(f'/cart/items/{cart_item.id}', json={"quantity": 5}, headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
        assert 'quantity' in response.json  # Changed from checking 'message' key

def test_remove_cart_item(client, admin_id, admin_token, app):
    with app.app_context():
        cart = Cart.query.filter_by(user_id=admin_id).first()
        if not cart:
            cart = Cart(user_id=admin_id)
            db.session.add(cart)
            db.session.commit()

        product = Product.query.filter_by(name="Bird Food").first()
        if not product:
            product = Product(name="Bird Food", price=8.0, stock_quantity=15, category="Food", image_url="http://example.com/birdfood.jpg")
            db.session.add(product)
            db.session.commit()

        cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product.id).first()
        if not cart_item:
            cart_item = CartItem(cart_id=cart.id, product_id=product.id, quantity=3)
            db.session.add(cart_item)
            db.session.commit()

        response = client.delete(f'/cart/items/{cart_item.id}', headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 204  # Changed from 200 to 204
        assert response.data == b''  # Empty response body for 204

def test_add_item_invalid_quantity(client, admin_id, admin_token, app):
    with app.app_context():
        product = Product.query.filter_by(name="Fish Food").first()
        if not product:
            product = Product(name="Fish Food", price=5.0, stock_quantity=10, category="Food", image_url="http://example.com/fishfood.jpg")
            db.session.add(product)
            db.session.commit()

        response = client.post('/cart/items', json={
            "product_id": product.id,
            "quantity": -1
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 400
