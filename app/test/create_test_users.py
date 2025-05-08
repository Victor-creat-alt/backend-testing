import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app import create_app, db
from app.models.User import User
from app.models.Service import Service
from app.models.Service_request import ServiceRequest
from app.models.Order import Order
from datetime import datetime, timedelta

def create_users():
    app = create_app()
    with app.app_context():
        # Create admin user
        admin = User.query.filter_by(email="victorkihiko211@gmail.com").first()
        if not admin:
            admin = User(username="adminuser", email="victorkihiko211@gmail.com", role="Admin")
            admin.set_password("adminpassword")
            admin.is_verified = True  # Set verified to True
            db.session.add(admin)
            print("Admin user created.")
        else:
            print("Admin user already exists.")

        # Create regular user
        regular_user = User.query.filter_by(email="testuser@example.com").first()
        if not regular_user:
            regular_user = User(username="testuser", email="testuser@example.com", role="User")
            regular_user.set_password("password123")
            regular_user.is_verified = True  # Set verified to True
            db.session.add(regular_user)
            print("Regular user created.")
        else:
            print("Regular user already exists.")

        db.session.commit()

        # Create a test service if not exists
        service = Service.query.filter_by(name="Test Service").first()
        if not service:
            service = Service(
                name="Test Service",
                description="Test service description",
                price=50.0,
                duration=60,
                image_url="http://example.com/image.jpg"
            )
            db.session.add(service)
            db.session.commit()
            print("Test service created.")
        else:
            print("Test service already exists.")

        # Create a test service request if not exists
        service_request = ServiceRequest.query.filter_by(user_id=regular_user.id, service_id=service.id).first()
        if not service_request:
            service_request = ServiceRequest(
                user_id=regular_user.id,
                service_id=service.id,
                appointment_time=datetime.utcnow() + timedelta(days=1),
                status="pending"
            )
            db.session.add(service_request)
            db.session.commit()
            print(f"Test service request created with ID {service_request.id}.")
        else:
            print("Test service request already exists.")

        # Create a test order if not exists
        order = Order.query.filter_by(user_id=regular_user.id).first()
        if not order:
            order = Order(
                user_id=regular_user.id,
                status="pending",
                total_price=100.0,
                created_at=datetime.utcnow()
            )
            db.session.add(order)
            db.session.commit()
            print(f"Test order created with ID {order.id}.")
        else:
            print("Test order already exists.")

        return {
            "admin_id": admin.id,
            "regular_user_id": regular_user.id,
            "service_request_id": service_request.id,
            "order_id": order.id
        }


if __name__ == "__main__":
    create_users()
