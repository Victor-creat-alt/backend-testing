from flask import Blueprint, request, jsonify
from app.models.Product import Product
from app import db
from app.schemas.Product_schemas import ProductSchema
from flask_jwt_extended import jwt_required

product_bp = Blueprint('product', __name__)
product_schema = ProductSchema()
product_list_schema = ProductSchema(many=True)

@product_bp.route('/products', methods=['GET'])
def get_all_products():
    products = Product.query.all()
    return jsonify(product_list_schema.dump(products)), 200

@product_bp.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    data = request.get_json()
    new_product = Product(
        name=data['name'],
        description=data['description'],
        price=data['price'],
        category=data['category'],
        stock_quantity=data['stock_quantity'],
        image_url=data.get('image_url')
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify(product_schema.dump(new_product)), 201

@product_bp.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required
def update_product(product_id):
    product =Product.query.get_or_404(product_id)
    data = request.get_json()
    product.name = data.get('name', product.name)
    product.description=data.get('description', product.description)
    product.price=data.get('price', product.price)
    product.category=data.get('category', product.category)
    product.stock_quantity=data.get('stock_quantity', product.stock_quantity)
    product.image_url=data.get('image_url', product.image_url)
    db.session.commit()
    return jsonify(product_schema.dump(product)), 200

@product_bp.route('/products/<int:product_id)>', methods=['DELETE'])
@jwt_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message':'Product deleted successfully'}), 200