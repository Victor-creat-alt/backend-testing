from flask import Blueprint, request, jsonify
from app import db
from app.models.Service import Service
from app.schemas.Service_schemas import ServiceSchema
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity

service_bp = Blueprint('service_bp', __name__)
service_schema = ServiceSchema()
services_schema = ServiceSchema(many=True)

@service_bp.before_request
def skip_options():
    if request.method == 'OPTIONS':
        return '', 200

@service_bp.route('/services', methods=['GET'])
def get_services():
    services = Service.query.all()
    serialized_services = services_schema.dump(services)
    return jsonify(serialized_services), 200

@service_bp.route('/services/<int:service_id>', methods=['GET'])
def get_service(service_id):
    service = Service.query.get_or_404(service_id)
    serialized_service = service_schema.dump(service)
    return jsonify(serialized_service), 200

@service_bp.route('/services', methods=['POST'])
@jwt_required()
def create_service():
    current_user = get_jwt_identity()
    if current_user["role"] != "Admin":
        return jsonify({'error': 'Admin role required to create services'}), 403
    json_data = request.get_json()
    if not json_data:
        return jsonify({'error': 'No input data provided'}), 400
    try:
        if 'name' not in json_data:
            return jsonify({'error': 'Missing field: name'}), 400
        if 'description' not in json_data:
            return jsonify({'error': 'Missing field: description'}), 400
        if 'price' not in json_data:
            return jsonify({'error': 'Missing field: price'}), 400
        if 'duration' not in json_data:
            return jsonify({'error': 'Missing field: duration'}), 400
        if 'image_url' not in json_data or not json_data['image_url']:
            return jsonify({'error': 'Missing field: image_url'}), 400
        if len(json_data['image_url']) > 1000000000:
            return jsonify({'error': 'image_url exceeds the maximum allowed length'}), 400

        if 'duration' in json_data:
            json_data['duration'] = str(json_data['duration'])

        new_service = service_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422

    db.session.add(new_service)
    db.session.commit()
    return jsonify({'message': 'Service created successfully', 'id': new_service.id}), 201

@service_bp.route('/services/<int:service_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_service(service_id):
    current_user = get_jwt_identity()
    if current_user["role"] != "Admin":
        return jsonify({'error': 'Admin role required to update services'}), 403
    service = Service.query.get_or_404(service_id)
    json_data = request.get_json()
    if not json_data:
        return jsonify({'error': 'No input data provided'}), 400
    try:
        print(f"Update Service Request JSON: {json_data}")

        if 'duration' in json_data:
            json_data['duration'] = str(json_data['duration'])

        data = service_schema.load(json_data, partial=True)
    except ValidationError as err:
        print(f"Validation errors: {err.messages}")
        return jsonify(err.messages), 422

    service.name = data.name if data.name is not None else service.name
    service.price = data.price if data.price is not None else service.price
    service.description = data.description if data.description is not None else service.description
    service.duration = data.duration if data.duration is not None else service.duration
    service.image_url = data.image_url if data.image_url is not None else service.image_url

    db.session.commit()
    return jsonify({'message': 'Service updated successfully'}), 200

@service_bp.route('/services/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(service_id):
    current_user = get_jwt_identity()
    if current_user["role"] != "Admin":
        return jsonify({'error': 'Admin role required to delete services'}), 403
    print(f"Delete Service Request for ID: {service_id}")
    service = Service.query.get_or_404(service_id)
    db.session.delete(service)
    db.session.commit()
    return jsonify({'message': 'Service deleted successfully'}), 200

@service_bp.route('/services/search', methods=['GET'])
def search_services():
    query = request.args.get('query', '')
    services = Service.query.filter(
        (Service.name.ilike(f"%{query}%")) | (Service.description.ilike(f"%{query}%"))
    ).all()
    serialized_services = services_schema.dump(services)
    return jsonify(serialized_services), 200
