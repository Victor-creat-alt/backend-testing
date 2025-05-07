import pytest
from app.models.Service import Service
from app.schemas.Service_schemas import ServiceSchema
from marshmallow import ValidationError
from app import db

@pytest.fixture(scope='session')
def app():
    from app import create_app
    app = create_app()
    app.config['TESTING'] = True
    with app.app_context():
        yield app

@pytest.fixture(scope='session')
def client(app):
    return app.test_client()

@pytest.fixture
def admin_token(app):
    from flask_jwt_extended import create_access_token
    from app.models.User import User
    with app.app_context():
        admin = User.query.filter_by(email="admin@example.com").first()
        if not admin:
            admin = User(username="adminuser", email="admin@example.com", role="Admin")
            admin.set_password("adminpassword")
            db.session.add(admin)
            db.session.commit()
        token = create_access_token(identity={"id": admin.id, "role": admin.role})
        return token

def test_get_all_services(client):
    response = client.get('/services')
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_create_service(client, admin_token):
    response = client.post('/services', json={
        "name": "Grooming",
        "description": "Pet grooming service",
        "price": 50.0,
        "duration": "60",
        "image_url": "http://example.com/service.jpg"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 201
    assert response.json['message'] == 'Service created successfully'
    assert 'id' in response.json

def test_service_schema_valid_data():
    service_data = {
        "name": "Training",
        "description": "Pet training service",
        "price": 75.0,
        "duration": "60",
        "image_url": "http://example.com/service.jpg"
    }
    schema = ServiceSchema()
    service = schema.load(service_data)
    assert service.name == "Training"
    assert service.price == 75.0
    assert service.duration == "60"

def test_service_schema_invalid_price():
    service_data = {
        "name": "Invalid Service",
        "description": "Invalid price",
        "price": -10.0,
        "duration": "30"
    }
    schema = ServiceSchema()
    with pytest.raises(ValidationError):
        schema.load(service_data)

def test_service_model_relationships(app):
    with app.app_context():
        service = Service(
            name="Sample",
            description="Sample service",
            price=20.0,
            duration="30",
            image_url="http://example.com/sample.jpg"
        )
        db.session.add(service)
        db.session.commit()
        assert hasattr(service, 'service_requests')

def test_service_schema_missing_name():
    service_data = {
        "description": "No name service",
        "price": 30.0,
        "duration": "45"
    }
    schema = ServiceSchema()
    with pytest.raises(ValidationError):
        schema.load(service_data)