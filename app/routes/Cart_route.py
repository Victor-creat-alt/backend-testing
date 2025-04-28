from flask import Blueprint, request, jsonify
from app.models.Cart import Cart
from app.models.CartItem import CartItem
from app import db
from app.schemas.Cart_schemas import CartSchema

cart_bp = Blueprint('cart', __name__)
cart_schema = CartSchema()
cart_list_schema = CartSchema(many=True)

@cart_bp.route('/carts', methods=['GET'])
def get_all_carts():
    carts = Cart.query.all()
    return jsonify(cart_list_schema.dump(carts)), 200


@cart_bp.route('/carts/<int:cart_id>', methods=['GET'])
def get_cart(cart_id):
    cart = Cart.query.get_or_404(cart_id)
    return jsonify(cart_schema.dump(cart)), 200

@cart_bp.route('/carts', methods=['POST'])
def create_cart():
    data = request.get_json()
    new_cart = Cart(user_id=data['user_id'])
    db.session.add(new_cart)
    db.session.commit()
    return jsonify(cart_schema.dump(new_cart)), 201

@cart_bp.route('/carts/<int:cart_id>', methods=['PUT'])
def update_cart(cart_id):
    cart = Cart.query.get_or_404(cart_id)
    data = request.get_json()
    cart.user_id = data.get('user_id',cart.user_id)
    db.session.commit()
    return jsonify(cart_schema.dump(cart)), 200

@cart_bp.route('/carts/<int:cart_id>', methods=['DELETE'])
def delete_cart(cart_id):
    cart = Cart.query.get_or_404(cart_id)
    db.session.delete(cart)
    db.session.commit()
    return jsonify({'message':'Cart deleted Successfully'}), 200