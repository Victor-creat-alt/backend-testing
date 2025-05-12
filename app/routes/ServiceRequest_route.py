from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.Service_request import ServiceRequest
from app.schemas.Servicerequest_schemas import ServiceRequestSchema
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError # Moved to top

service_request_bp = Blueprint('service_request', __name__, url_prefix='/service_requests')
service_request_schema = ServiceRequestSchema()
service_requests_schema = ServiceRequestSchema(many=True)

def is_admin(user):
    return user.get('role') == 'Admin'

@service_request_bp.before_request
def skip_jwt_for_options():
    if request.method == 'OPTIONS':
        return '', 200

# Geting all service requests for regular user
@service_request_bp.route('/', methods=['GET'])
@jwt_required()
def get_service_requests():
    current_user = get_jwt_identity()
    if is_admin(current_user):
        # Admin can view all service requests with nested service data
        service_requests = ServiceRequest.query.options(db.joinedload(ServiceRequest.service)).all()
    else:
        # Regular user can view only their own
        service_requests = ServiceRequest.query.options(db.joinedload(ServiceRequest.service)).filter_by(user_id=current_user['id']).all()
    return jsonify(service_requests_schema.dump(service_requests)), 200

# Admin route to update status of any service request
@service_request_bp.route('/<int:id>/status', methods=['PUT'])
@jwt_required()
def update_service_request_status(id):
    current_user = get_jwt_identity()
    if not is_admin(current_user):
        return jsonify({'error': 'Admin role required'}), 403
    service_request = ServiceRequest.query.get_or_404(id)
    data = request.get_json()
    status = data.get('status')
    if not status:
        return jsonify({'error': 'Status is required'}), 400
    service_request.status = status
    db.session.commit()
    return jsonify({'message': 'Service request status updated successfully'}), 200

# Geting service request by ID
@service_request_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_service_request(id):
    current_user = get_jwt_identity()
    service_request = ServiceRequest.query.get_or_404(id)
    if not is_admin(current_user) and service_request.user_id != current_user['id']:
        return jsonify({'error': 'Unauthorized'}), 403
    return jsonify(service_request_schema.dump(service_request)), 200

# Creating service request
@service_request_bp.route('/', methods=['POST'])
@jwt_required()
def create_service_request():
    data = request.get_json()
    current_user = get_jwt_identity()
    try:
        new_service_request_data = service_request_schema.load(data)
    except ValidationError as err:
        current_app.logger.error(f"Service request validation errors: {err.messages}")
        # Return detailed validation errors in response
        return jsonify({'validation_errors': err.messages}), 400
    except Exception as e:
        current_app.logger.error(f"Unexpected error during service request creation: {str(e)}")
        return jsonify({'error': 'Unexpected error occurred'}), 500
    new_service_request = ServiceRequest(
        user_id=current_user['id'],
        service_id=new_service_request_data.service_id,
        appointment_time=new_service_request_data.appointment_time,
        status=new_service_request_data.status or 'pending'
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
    if not is_admin(current_user) and service_request.user_id != current_user['id']:
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    errors = service_request_schema.validate(data)
    if errors:
        current_app.logger.error(f"Service request update validation errors: {errors}")
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
    if not is_admin(current_user) and service_request.user_id != current_user['id']:
        return jsonify({'error': 'Unauthorized'}), 403
    db.session.delete(service_request)
    db.session.commit()
    return '', 204
