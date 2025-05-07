from flask import Blueprint, request
from flask_restful import Api, Resource
from marshmallow import ValidationError
from app import db
from app.models.CartItem import CartItem
from app.models.Cart import Cart
from app.schemas.CartItem_schema import CartItemSchema
from flask_jwt_extended import jwt_required, get_jwt_identity

cart_item_bp = Blueprint('cart_item', __name__, url_prefix='/cart/items')
api = Api(cart_item_bp)

cart_item_schema = CartItemSchema()
cart_items_schema = CartItemSchema(many=True)

class CartItemResource(Resource):
    @jwt_required()
    def get(self, item_id):
        try:
            cart_item = db.session.get(CartItem, item_id)
            if cart_item is None:
                return {"error": "Cart item not found"}, 404
            user_id = get_jwt_identity()['id']
            if cart_item.cart.user_id != user_id:
                return {"error": "Unauthorized"}, 403
            return cart_item_schema.dump(cart_item), 200
        except Exception as e:
            print(f"Error getting cart item {item_id}: {str(e)}")
            return {"error": "Error retrieving cart item"}, 500

    @jwt_required()
    def put(self, item_id):
        try:
            cart_item = db.session.get(CartItem, item_id)
            if cart_item is None:
                return {"error": "Cart item not found"}, 404
            user_id = get_jwt_identity()['id']
            if cart_item.cart.user_id != user_id:
                return {"error": "Unauthorized"}, 403
            data = request.get_json()
            if 'quantity' in data:
                cart_item.quantity = data['quantity']
            db.session.commit()
            return cart_item_schema.dump(cart_item), 200
        except Exception as e:
            db.session.rollback()
            print(f"Error updating cart item {item_id}: {str(e)}")
            return {"error": "Error updating cart item"}, 500

    @jwt_required()
    def delete(self, item_id):
        try:
            cart_item = db.session.get(CartItem, item_id)
            if cart_item is None:
                return {"error": "Cart item not found"}, 404
            user_id = get_jwt_identity()['id']
            if cart_item.cart.user_id != user_id:
                return {"error": "Unauthorized"}, 403
            db.session.delete(cart_item)
            db.session.commit()
            return {}, 204
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting cart item {item_id}: {str(e)}")
            return {"error": "Error deleting cart item"}, 500

class CartItemListResource(Resource):
    @jwt_required()
    def post(self):
        try:
            data = request.get_json()
            user_id = get_jwt_identity()['id']
            cart = Cart.query.filter_by(user_id=user_id).first()
            if not cart:
                cart = Cart(user_id=user_id)
                db.session.add(cart)
                db.session.commit()

            # Validate required fields
            if 'quantity' not in data:
                return {"error": "quantity is required"}, 400
            if 'product_id' not in data and 'service_id' not in data:
                return {"error": "Either product_id or service_id is required"}, 400

            # Use schema load for validation
            cart_item = cart_item_schema.load({
                "cart_id": cart.id,
                "product_id": data.get('product_id'),
                "service_id": data.get('service_id'),
                "quantity": data['quantity']
            })

            db.session.add(cart_item)
            db.session.commit()

            return cart_item_schema.dump(cart_item), 201
        except ValidationError as err:
            return {"errors": err.messages}, 400
        except Exception as e:
            db.session.rollback()
            print(f"Error adding item to cart: {str(e)}")
            return {"error": "Error adding item to cart"}, 500

api.add_resource(CartItemListResource, '')
api.add_resource(CartItemResource, '/<int:item_id>')
