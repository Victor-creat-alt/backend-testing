import pytest
from app import create_app
from app.models.User import User
from app.schemas.User_schema import UserSchema
from marshmallow import ValidationError
from flask_jwt_extended import create_access_token
from app import db

@pytest.fixture(scope='session')
def app():
    app = create_app()
    app.config['TESTING'] = True
    with app.app_context():
        yield app

@pytest.fixture(scope='session')
def client(app):
    return app.test_client()

@pytest.fixture(autouse=True)
def cleanup_users(app):
    with app.app_context():
        try:
            from app.models.Order import Order
            from app.models.Service_request import ServiceRequest
            from app.models.Cart import Cart

            usernames = ["testuser", "duplicateuser", "validuser", "user2", "user3"]

            orders_to_delete = Order.query.filter(Order.user.has(User.username.in_(usernames))).all()
            for order in orders_to_delete:
                db.session.delete(order)

            service_requests_to_delete = ServiceRequest.query.filter(ServiceRequest.user.has(User.username.in_(usernames))).all()
            for sr in service_requests_to_delete:
                db.session.delete(sr)

            carts_to_delete = Cart.query.filter(Cart.user.has(User.username.in_(usernames))).all()
            for cart in carts_to_delete:
                db.session.delete(cart)

            db.session.commit()

            User.query.filter(User.username.in_(usernames)).delete(synchronize_session=False)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise
    yield
    with app.app_context():
        try:
            from app.models.Order import Order
            from app.models.Service_request import ServiceRequest
            from app.models.Cart import Cart

            usernames = ["testuser", "duplicateuser", "validuser", "user2", "user3"]

            orders_to_delete = Order.query.filter(Order.user.has(User.username.in_(usernames))).all()
            for order in orders_to_delete:
                db.session.delete(order)

            service_requests_to_delete = ServiceRequest.query.filter(ServiceRequest.user.has(User.username.in_(usernames))).all()
            for sr in service_requests_to_delete:
                db.session.delete(sr)

            carts_to_delete = Cart.query.filter(Cart.user.has(User.username.in_(usernames))).all()
            for cart in carts_to_delete:
                db.session.delete(cart)

            db.session.commit()

            User.query.filter(User.username.in_(usernames)).delete(synchronize_session=False)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

@pytest.fixture
def user_token(app):
    with app.app_context():
        user = User.query.filter_by(username="testuser").first()
        if not user:
            user = User(username="testuser", email="testuser@example.com", role="User")
            user.set_password("password123")
            user.is_verified = True
            db.session.add(user)
            try:
                db.session.commit()
            except Exception:
                db.session.rollback()
                raise
        else:
            if not user.is_verified:
                user.is_verified = True
                db.session.commit()
        token = create_access_token(identity={"id": user.id, "role": user.role})
    return token

def test_register_user(client):
    response = client.post('/auth/signup', json={
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    assert 'message' in response.json
    assert response.json['message'] == "User created successfully. Please check your email to verify your account."

def test_login_user(client, user_token):
    response = client.post('/auth/login', json={
        "email": "testuser@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert 'access_token' in response.json

def test_user_schema_valid_data(app):
    user_data = {
        "username": "validuser",
        "email": "validuser@example.com",
        "password": "validpass123",
        "role": "User",
        "is_verified": True
    }
    with app.app_context():
        schema = UserSchema()
        user = schema.load(user_data)
        assert user.username == "validuser"
        assert user.email == "validuser@example.com"

def test_user_schema_invalid_email(app):
    user_data = {
        "username": "user2",
        "email": "invalidemail",
        "password": "password123",
        "role": "User"
    }
    with app.app_context():
        schema = UserSchema()
        with pytest.raises(ValidationError):
            schema.load(user_data)

def test_user_schema_duplicate_username(app):
    with app.app_context():
        existing_user = User(username="duplicateuser", email="dup@example.com", role="User")
        existing_user.set_password("password123")
        db.session.add(existing_user)
        db.session.commit()

    user_data = {
        "username": "duplicateuser",
        "email": "newemail@example.com",
        "password": "password123",
        "role": "User"
    }
    with app.app_context():
        schema = UserSchema()
        with pytest.raises(ValidationError):
            schema.load(user_data)

def test_user_model_password_hashing():
    user = User(username="hashuser", email="hash@example.com")
    user.set_password("mypassword")
    assert user.check_password("mypassword")
    assert not user.check_password("wrongpassword")

def test_user_2fa_methods():
    user = User(username="fauser", email="fa@example.com")
    secret = "JBSWY3DPEHPK3PXP"
    user.set_two_fa_secret(secret)
    assert user.get_two_fa_secret() == secret
    user.is_2fa_enabled = True
    assert user.is_two_fa_active()

def test_user_verification_code():
    user = User(username="verifyuser", email="verify@example.com")
    user.set_verification_code("123456")
    assert user.verification_code == "123456"

def test_user_schema_invalid_role(app):
    user_data = {
        "username": "user3",
        "email": "user3@example.com",
        "password": "password123",
        "role": "InvalidRole",
        "is_verified": True
    }
    with app.app_context():
        schema = UserSchema()
        with pytest.raises(ValidationError):
            schema.load(user_data)

def test_dummy():
    assert True
