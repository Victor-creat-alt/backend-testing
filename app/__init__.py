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
# Construct absolute path to migrations directory based on this file's location
APP_DIR = os.path.abspath(os.path.dirname(__file__))
MIGRATIONS_DIR_INIT = os.path.join(APP_DIR, 'migrations')
migrate = Migrate(directory=MIGRATIONS_DIR_INIT) # Instantiated with directory
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
    # The directory was set in the Migrate() constructor.
    # If you want to ensure it's set here relative to app.root_path:
    # effective_migrations_dir = os.path.join(app.root_path, 'migrations')
    # migrate.init_app(app, db, directory=effective_migrations_dir)
    # Using the one from your pasted code:
    migrate.init_app(app, db, directory='app/migrations')
    mail.init_app(app)  # Initialize Flask-Mail with app

    # Set up CORS
    # Only allow the frontend URL specified in the environment variable
    env_frontend_url = os.getenv('FRONTEND_URL', '').strip()
    allowed_origins = []
    if env_frontend_url:
        allowed_origins.append(env_frontend_url)
    else:
        # Fallback if FRONTEND_URL is not set. This is a critical configuration.
        print("WARNING: FRONTEND_URL environment variable is not set. CORS will likely block frontend requests.")
        # Consider if you want a hard error here or a very restrictive default.
        # For now, if not set, allowed_origins will be empty, blocking CORS.

    CORS(app,
         resources={r"/*": {"origins": allowed_origins}},
         supports_credentials=True,
         allow_headers=["Authorization", "Content-Type", "X-CSRF-Token"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    )

    # JWT error handlers
    from flask_jwt_extended.exceptions import NoAuthorizationError
    from flask_jwt_extended import exceptions as jwt_exceptions
    from flask import jsonify

    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({"error": "Missing Authorization Header"}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(callback):
        return jsonify({"error": "Invalid token"}), 422

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    @jwt.revoked_token_loader
    def revoked_token_response(jwt_header, jwt_payload):
        return jsonify({"error": "Token has been revoked"}), 401

    @jwt.needs_fresh_token_loader
    def needs_fresh_token_response(jwt_header, jwt_payload):
        return jsonify({"error": "Fresh token required"}), 401

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
