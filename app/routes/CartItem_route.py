from flask import Blueprint, request, jsonify
from app.models.CartItem import CartItem
from app import db
from app.schemas.Cart_item_schemas import CartItemsSchema
from flask_jwt_extended import jwt_required

cart_item_bp = Blueprint('cart_item', __name__)
cart_item_schema = CartItemsSchema()
cart_item_list_schema = CartItemsSchema(many=True)


@cart_item_bp.route('/cart-items', methods=['GET'])
@jwt_required
def get_all_cart_items():
    cart_items = CartItem.query.all()
    return jsonify(cart_item_list_schema.dump(cart_items)), 200

@cart_item_bp.route('/cart-items/<int:cart_item_id>', methods=['GET'])
@jwt_required
def get_cart_item(cart_item_id):
    cart_item = CartItem.query.get_or_404(cart_item_id)
    return jsonify(cart_item_schema.dump(cart_item)), 200

@cart_item_bp.route('/cart-items', methods=['POST'])
@jwt_required
def create_cart_item():
    data = request.get_json()
    new_cart_item = CartItem(
        cart_id=data['cart_id'],
        product_id=data['product_id'],
        quantity=data['quantity']
    )
    db.session.add(new_cart_item)
    db.sessin.commit()
    return jsonify(cart_item_schema.dump(new_cart_item)), 201

@cart_item_bp.route('/cart-items/<int:cart_item_id>', methods=['PUT'])
@jwt_required
def update_cart_item(cart_item_id):
    cart_item = CartItem.query.get_or_404(cart_item_id)
    data = request.get_json()
    cart_item.quantity = data.get('quantity', cart_item.quantity)
    db.session.commit()
    return jsonify(cart_item_schema.dump(cart_item)), 200

@cart_item_bp.route('/cart-items/<int:cart_item_id>', methods=['DELETE'])
@jwt_required
def delete_cart_item(cart_item_id):
    cart_item = CartItem.query.get_or_404(cart_item_id)
    db.session.delete(cart_item)
    db.session.commit()
    return jsonify({'message':'Cart Item deleted successfully'}), 200