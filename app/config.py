import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """
    Configuration class for the Flask application.
    """
    # General Configurations
    SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default_jwt_secret_key")

    # PostgreSQL Database Configuration
    # Update the DATABASE_URL environment variable with your actual PostgreSQL connection string including username and password
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql://victor:1234@localhost:5432/vetty")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

   

    # Debugging and Testing
    TESTING = os.getenv("TESTING", "False").lower() in ["true", "1"]
    DEBUG = os.getenv("DEBUG", "False").lower() in ["true", "1"] #added debug
    
    # SMTP Configuration
    SMTP_EMAIL = os.getenv("SMTP_EMAIL")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")  # Default to Gmail
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))  # Default to 587 for STARTTLS

    # Mail default sender
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")
