# jwt_utils.py
from flask_jwt_extended import create_access_token, create_refresh_token

def generate_jwt_token(user):
    """
    Generates JWT access and refresh tokens for a user.
    Args:
        user: The User object.
    Returns:
        A tuple containing the access token and the refresh token.
    """
    access_token = create_access_token(identity={"id": user.id, "role": user.role})
    refresh_token = create_refresh_token(identity={"id": user.id, "role": user.role})
    return access_token, refresh_token
