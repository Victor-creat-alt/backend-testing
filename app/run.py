import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Initialize SQLAlchemy instance (no app yet)
db = SQLAlchemy()

# Create Flask app and configure it
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Hook db to app
db.init_app(app)


# Create tables and run app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
