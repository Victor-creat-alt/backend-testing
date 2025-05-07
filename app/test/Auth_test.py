import pytest
from app import create_app, db
from flask_jwt_extended import decode_token

@pytest.fixture(scope='module')
def test_client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()

def test_signup_login_logout(test_client):
    # Test signup
    signup_data = {
        "username": "newuser",
        "email": "mark.kibet@student.moringaschool.com",
        "password": "newpassword",
        "role": "User"
    }
    signup_response = test_client.post('/auth/signup', json=signup_data)
    assert signup_response.status_code == 201
    assert "User created successfully" in signup_response.get_json().get('message', '')

    # Test login with unverified email (should fail)
    login_data = {
        "email": "mark.kibet@student.moringaschool.com",
        "password": "newpassword"
    }
    login_response = test_client.post('/auth/login', json=login_data)
    assert login_response.status_code == 403
    assert "Email not verified" in login_response.get_json().get('error', '')

    # Verify email
    verify_data = {
        "email": "mark.kibet@student.moringaschool.com",
        "code": "000000"  # This will fail, so we fetch the actual code from DB
    }
    # Fetch actual verification code from DB
    from app.models.User import User
    from app import db as _db
    with test_client.application.app_context():
        user = User.query.filter_by(email="mark.kibet@student.moringaschool.com").first()
        verify_data['code'] = user.verification_code

    verify_response = test_client.post('/auth/verify-email', json=verify_data)
    assert verify_response.status_code == 200
    assert "Email verified successfully" in verify_response.get_json().get('message', '')

    # Test login with verified email (should succeed)
    login_response = test_client.post('/auth/login', json=login_data)
    assert login_response.status_code == 200
    access_token = login_response.get_json().get('access_token')
    assert access_token is not None

    # Decode token to check identity
    decoded = decode_token(access_token)
    assert decoded['sub']['role'] == "User"

    # Test auto-login with token
    headers = {'Authorization': f'Bearer {access_token}'}
    auto_login_response = test_client.get('/auth/auto-login', headers=headers)
    assert auto_login_response.status_code == 200
    assert auto_login_response.get_json().get('user')['role'] == "User"

    # Test logout
    logout_response = test_client.post('/auth/logout', headers=headers)
    assert logout_response.status_code == 200
    assert "Logout handled" in logout_response.get_json().get('message', '')
