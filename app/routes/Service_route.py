from flask import Blueprint, request, jsonify
from app import db
from app.models.Service import Service
from app.schemas.Service_schemas import ServiceSchema
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity

service_bp = Blueprint('service_bp', __name__)
service_schema = ServiceSchema()
services_schema = ServiceSchema(many=True)

@service_bp.route('/services', methods=['GET'])
def get_services():
    services = Service.query.all()
    # Use Marshmallow's `dump` method to serialize the data
    serialized_services = services_schema.dump(services)
    # Use Flask's `jsonify` to return the serialized data as JSON
    return jsonify(serialized_services), 200

@service_bp.route('/services/<int:service_id>', methods=['GET'])
def get_service(service_id):
    service = Service.query.get_or_404(service_id)
    # Serialize the single service object and return it as JSON
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
        # Validate that all required fields are present
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
        if len(json_data['image_url']) > 1000000000:# reasonable limit for imageurl length 
            return jsonify({'error': 'image_url exceeds the maximum allowed length'}), 400

        # Load and validate the data, and create a Service object
        new_service = service_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422

    # Add the new service to the database
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
        # Load and validate the data, allowing partial updates
        data = service_schema.load(json_data, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 422

    # Update the service fields
    service.name = data.get('name', service.name)
    service.price = data.get('price', service.price)
    service.description = data.get('description', service.description)
    service.duration = data.get('duration', service.duration)
    service.image_url = data.get('image_url', service.image_url)

    # Commit the changes to the database
    db.session.commit()
    return jsonify({'message': 'Service updated successfully'}), 200

@service_bp.route('/services/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(service_id):
    current_user = get_jwt_identity()
    if current_user["role"] != "Admin":
        return jsonify({'error': 'Admin role required to delete services'}), 403
    service = Service.query.get_or_404(service_id)
    db.session.delete(service)
    db.session.commit()
    return jsonify({'message': 'Service deleted successfully'}), 200

@service_bp.route('/services/search', methods=['GET'])
def search_services():
    """
    Search services by name or description.
    """
    query = request.args.get('query', '')
    services = Service.query.filter(
        (Service.name.ilike(f"%{query}%")) | (Service.description.ilike(f"%{query}%"))
    ).all()
    # Serialize the search results and return them as JSON
    serialized_services = services_schema.dump(services)
    return jsonify(serialized_services), 200