from flask import Blueprint, request, jsonify
from app import db
from app.models.Product import Product
from flask_jwt_extended import jwt_required, get_jwt_identity

product_bp = Blueprint('product_bp', __name__)

@product_bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'price': p.price,
        'description': p.description,
        'category': p.category,
        'stock_quantity': p.stock_quantity,
        'image_url': p.image_url,
        'created_at': p.created_at,
        'discount': p.discount
    } for p in products]), 200

@product_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify({
        'id': product.id,
        'name': product.name,
        'price': product.price,
        'description': product.description,
        'category': product.category,
        'stock_quantity': product.stock_quantity,
        'image_url': product.image_url,
        'created_at': product.created_at,
        'discount': product.discount
    }), 200

@product_bp.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    current_user = get_jwt_identity()
    if current_user["role"] != "Admin":
        return jsonify({'error': 'Admin role required to create products'}), 403
    data = request.get_json()
    try:
        # Validate that all required fields are present
        if 'name' not in data:
            return jsonify({'error': 'Missing field: name'}), 400
        if 'price' not in data:
            return jsonify({'error': 'Missing field: price'}), 400
        if 'category' not in data:
            return jsonify({'error': 'Missing field: category'}), 400
        if 'stock_quantity' not in data:
            return jsonify({'error': 'Missing field: stock_quantity'}), 400
        if 'image_url' not in data or not data['image_url']:
            return jsonify({'error': 'Missing field: image_url'}), 400
        if len(data['image_url']) > 10000000: #a reasonable limit for image_url length
            return jsonify({'error': 'image_url exceeds the maximum length of 1024 characters'}), 400

        new_product = Product(
            name=data['name'],
            price=data['price'],
            description=data.get('description'),
            category=data['category'],
            stock_quantity=data['stock_quantity'],
            image_url=data['image_url'],
            discount=data.get('discount', 0.0)  # Default to 0.0 if not provided
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({'message': 'Product created successfully', 'id': new_product.id}), 201
    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), 400

@product_bp.route('/products/<int:product_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_product(product_id):
    current_user = get_jwt_identity()
    if current_user["role"] != "Admin":
        return jsonify({'error': 'Admin role required to update products'}), 403
    product = Product.query.get_or_404(product_id)
    data = request.get_json()

    product.name = data.get('name', product.name)
    product.price = data.get('price', product.price)
    product.description = data.get('description', product.description)
    product.category = data.get('category', product.category)
    product.stock_quantity = data.get('stock_quantity', product.stock_quantity)
    product.image_url = data.get('image_url', product.image_url)
    product.discount = data.get('discount', product.discount)

    db.session.commit()
    return jsonify({'message': 'Product updated successfully'}), 200

@product_bp.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    current_user = get_jwt_identity()
    if current_user["role"] != "Admin":
        return jsonify({'error': 'Admin role required to delete products'}), 403
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted'}), 200

@product_bp.route('/products/search', methods=['GET'])
def search_products():
    """
    Search products by name or category.
    """
    query = request.args.get('query', '')
    products = Product.query.filter(
        (Product.name.ilike(f"%{query}%")) | (Product.category.ilike(f"%{query}%"))
    ).all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'price': p.price,
        'description': p.description,
        'category': p.category,
        'stock_quantity': p.stock_quantity,
        'image_url': p.image_url,
        'created_at': p.created_at,
        'discount': p.discount
    } for p in products]), 200