from flask import Blueprint, request, jsonify
from app import db
from app.models.Service_request import ServiceRequest
from app.schemas.Servicerequest_schemas import ServiceRequestSchema
from flask_jwt_extended import jwt_required, get_jwt_identity

service_request_bp = Blueprint('service_request', __name__, url_prefix='/service_requests')
service_request_schema = ServiceRequestSchema()
service_requests_schema = ServiceRequestSchema(many=True)

# Geting all service requests
@service_request_bp.route('/', methods=['GET'])
@jwt_required()
def get_service_requests():
    current_user = get_jwt_identity()
    service_requests = ServiceRequest.query.filter_by(user_id=current_user['id']).all()
    return jsonify(service_requests_schema.dump(service_requests)), 200

# Geting service request by ID
@service_request_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_service_request(id):
    current_user = get_jwt_identity()
    service_request = ServiceRequest.query.get_or_404(id)
    if service_request.user_id != current_user['id']:
        return jsonify({'error': 'Unauthorized'}), 403
    return jsonify(service_request_schema.dump(service_request)), 200

# Creating service request
@service_request_bp.route('/', methods=['POST'])
@jwt_required()
def create_service_request():
    data = request.get_json()
    current_user = get_jwt_identity()
    errors = service_request_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    new_service_request = ServiceRequest(
        user_id=current_user['id'],
        service_id=data['service_id'],
        appointment_time=data['appointment_time'],
        status=data.get('status', 'pending')
    )
    db.session.add(new_service_request)
    db.session.commit()
    return jsonify(service_request_schema.dump(new_service_request)), 201

# Updating service request
@service_request_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_service_request(id):
    current_user = get_jwt_identity()
    service_request = ServiceRequest.query.get_or_404(id)
    if service_request.user_id != current_user['id']:
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    errors = service_request_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    service_request.user_id = current_user['id']
    service_request.service_id = data['service_id']
    service_request.appointment_time = data['appointment_time']
    if 'status' in data:
        service_request.status = data['status']
    db.session.commit()
    return jsonify(service_request_schema.dump(service_request)), 200

# Deleting service request
@service_request_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_service_request(id):
    current_user = get_jwt_identity()
    service_request = ServiceRequest.query.get_or_404(id)
    if service_request.user_id != current_user['id']:
        return jsonify({'error': 'Unauthorized'}), 403
    db.session.delete(service_request)
    db.session.commit()
    return '', 204