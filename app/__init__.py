from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_mail import Mail  # Added import for Flask-Mail

# Load environment variables from .env file
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
mail = Mail()  # Initialize mail instance

def create_app():
    """
    Factory function to create and configure the Flask application.
    """
    app = Flask(__name__)

    # Load configuration from config.py
    app.config.from_object("app.config.Config")

    # Initialize extensions with the app
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)  # Initialize Flask-Mail with app

    # Enable CORS for all routes and origins
    CORS(app)

    # Import and register all blueprints
    from app.routes import (
        user_bp,
        auth_bp,
        admin_bp,
        cart_bp,
        cart_item_bp,
        product_bp,
        payment_bp,
        order_bp,
        service_bp,
        service_request_bp,
    )
    # Import API documentation blueprint

    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(admin_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(cart_item_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(service_bp)
    app.register_blueprint(service_request_bp)

    return app
