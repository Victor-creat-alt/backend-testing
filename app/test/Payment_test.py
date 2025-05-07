import pytest
from app import db
from app.models.Payment import Payment
from app.models.Order import Order
from app.models.OrderItem import OrderItem
from app.schemas.Payment_schemas import PaymentSchema
from marshmallow import ValidationError
from unittest.mock import patch, Mock

@pytest.fixture(autouse=True)
def setup_order(app):
    with app.app_context():
        # Clean up existing test data to avoid duplicates and foreign key issues
        Payment.query.filter_by(order_id=1).delete()  # Delete associated payments first
        OrderItem.query.filter_by(order_id=1).delete()  # Delete order items before order
        Order.query.filter_by(id=1).delete()
        from app.models.User import User
        user = User.query.filter_by(username="testuser").first()
        if user:
            db.session.delete(user)
            db.session.commit()
        user = User(username="testuser", email="testuser@example.com", role="User")
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()

        # Create order with id=1 for foreign key constraints
        order = Order(id=1, user_id=user.id, total_price=100.0, status="pending", delivery_address="123 Main St")
        db.session.add(order)
        db.session.commit()

@patch('app.utils.payment_util.requests.post')
@patch('app.utils.payment_util.requests.get')
def test_mpesa_payment(mock_get, mock_post, client):
    # Mock the GET request to return a valid access token
    mock_get_response = Mock()
    mock_get_response.json.return_value = {"access_token": "mocked_access_token"}
    mock_get.return_value = mock_get_response

    # Mock the POST request to return a successful payment initiation response
    mock_post_response = Mock()
    mock_post_response.json.return_value = {"ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing"}
    mock_post.return_value = mock_post_response

    response = client.post('/payments/mpesa', json={
        "phone_number": "254712345678",
        "amount": 100,
        "order_id": 1,
        "account_reference": "VETTY",
        "transaction_desc": "Test Payment"
    })
    assert response.status_code == 200
    assert "Payment initiated" in response.json["message"]

def test_payment_schema_valid_data(app):
    payment_data = {
        "order_id": 1,
        "amount": 100.0,
        "payment_method": "m-pesa",
        "status": "pending"
    }
    with app.app_context():
        schema = PaymentSchema()
        payment = schema.load(payment_data)
        assert payment.order_id == 1
        assert payment.status == "pending"

def test_payment_schema_invalid_status(app):
    payment_data = {
        "order_id": 1,
        "amount": 100.0,
        "payment_method": "m-pesa",
        "status": "invalid_status"
    }
    with app.app_context():
        schema = PaymentSchema()
        with pytest.raises(ValidationError):
            schema.load(payment_data)

def test_payment_model_relationship():
    payment = Payment(order_id=1, amount=100.0, payment_method="m-pesa", status="pending")
    assert hasattr(payment, 'order')

def test_dummy():
    assert True
