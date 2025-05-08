import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

from app import create_app, db

app = create_app()

# Create tables and run app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
