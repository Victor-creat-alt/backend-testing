from flask import Blueprint,request,jsonify
from app.models.User import User
from app import db
from app.schemas.User_schema import UserSchema
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)
user_schema = UserSchema()

@auth_bp.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error':"Email already exists"}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'Error':'Username already exists'}), 400
    
    new_user = User(
        username=data['username'],
        email=data['email']
    )
    new_user.set_password(data['password'])
    db.session0.add(new_user)
    db.session.commit()
    return jsonify(user_schema.dump(new_user)), 201

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user= User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error':'Invalid email or password'}), 401
    
    access_token = create_access_token(identity={'id':user.id, 'role':user.role}, expires_delta=timedelta(hours=1))
    return jsonify({'access token': access_token}), 200

@auth_bp.route('/auth/current', method=['GET'])
@jwt_required()
def get_current_user():
    current_user= get_jwt_identity()
    user = User.query.get_or_404(current_user['id'])
    return jsonify(user_schema.dump(user)), 200


