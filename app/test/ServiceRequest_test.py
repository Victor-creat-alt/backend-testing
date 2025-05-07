import pytest
from app.models.Service_request import ServiceRequest
from app.schemas.Servicerequest_schemas import ServiceRequestSchema
from marshmallow import ValidationError
from app import db
from app.models.User import User
from app.models.Service import Service

import datetime

@pytest.fixture(scope='function')
def setup_user_service(app):
    with app.app_context():
        # Check if user exists
        user = User.query.filter_by(username='testuser_sr').first()
        if not user:
            user = User(username='testuser_sr', email='testuser_sr@example.com', role='User')
            user.set_password('password')
            try:
                db.session.add(user)
                db.session.commit()
            except Exception:
                db.session.rollback()
                user = User.query.filter_by(username='testuser_sr').first()

        # Check if service exists
        service = Service.query.filter_by(name='Test Service SR').first()
        if not service:
            service = Service(
                name='Test Service SR',
                description='Test service description',
                price=100.0,
                duration=30,  # Assuming duration is integer minutes
                image_url='http://example.com/image.jpg'
            )
            try:
                db.session.add(service)
                db.session.commit()
            except Exception:
                db.session.rollback()
                service = Service.query.filter_by(name='Test Service SR').first()

        yield user, service

        # Cleanup
        try:
            if service:
                db.session.delete(service)
            if user:
                db.session.delete(user)
            db.session.commit()
        except Exception:
            db.session.rollback()

def test_create_service_request(client, user_token, setup_user_service):
    user, service = setup_user_service
    future_time = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat()
    response = client.post('/service_requests/', json={
        "user_id": user.id,
        "service_id": service.id,
        "appointment_time": future_time,
        "status": "pending"
    }, headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 201
    assert 'user_id' in response.json

def test_get_all_service_requests(client, admin_token):
    response = client.get('/service_requests/', headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_service_request_schema_valid_data(setup_user_service):
    user, service = setup_user_service
    future_time = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat()
    data = {
        "user_id": user.id,
        "service_id": service.id,
        "appointment_time": future_time,
        "status": "pending"
    }
    schema = ServiceRequestSchema()
    service_request = schema.load(data)
    assert service_request.user_id == user.id
    assert service_request.service_id == service.id

def test_service_request_schema_invalid_date(setup_user_service):
    user, service = setup_user_service
    data = {
        "user_id": user.id,
        "service_id": service.id,
        "appointment_time": "invalid-date"
    }
    schema = ServiceRequestSchema()
    with pytest.raises(ValidationError):
        schema.load(data)

def test_service_request_model_relationships(setup_user_service, app):
    with app.app_context():
        user, service = setup_user_service
        sr = ServiceRequest(user_id=user.id, service_id=service.id, appointment_time="2025-05-01T10:00:00", status="pending")
        db.session.add(sr)
        db.session.commit()
        assert hasattr(sr, 'user')
        assert hasattr(sr, 'service')

def test_service_request_schema_missing_user_id(setup_user_service):
    user, service = setup_user_service
    data = {
        "service_id": service.id,
        "appointment_time": "2025-05-01T10:00:00"
    }
    schema = ServiceRequestSchema()
    with pytest.raises(ValidationError):
        schema.load(data)

def test_service_request_schema_invalid_status(setup_user_service):
    user, service = setup_user_service
    future_time = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat()
    data = {
        "user_id": user.id,
        "service_id": service.id,
        "appointment_time": future_time,
        "status": "invalid_status"
    }
    schema = ServiceRequestSchema()
    with pytest.raises(ValidationError) as excinfo:
        schema.load(data)
    assert "Status must be one of" in str(excinfo.value)

def test_service_request_schema_past_appointment_time(setup_user_service):
    user, service = setup_user_service
    past_time = (datetime.datetime.utcnow() - datetime.timedelta(days=1)).isoformat()
    data = {
        "user_id": user.id,
        "service_id": service.id,
        "appointment_time": past_time,
        "status": "pending"
    }
    schema = ServiceRequestSchema()
    with pytest.raises(ValidationError) as excinfo:
        schema.load(data)
    assert "Appointment time must be in the future" in str(excinfo.value)