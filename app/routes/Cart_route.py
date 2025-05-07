from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from marshmallow import ValidationError
from app import db
from app.models.Cart import Cart
from app.schemas.Cart_schemas import CartSchema
from flask_jwt_extended import jwt_required, get_jwt_identity

cart_bp = Blueprint('cart', __name__, url_prefix='/cart') # Corrected URL prefix
api = Api(cart_bp)

cart_schema = CartSchema()
carts_schema = CartSchema(many=True)

class CartResource(Resource):
    @jwt_required()
    def get(self): # Removed cart_id from the path and function, will use current user's cart
        user_id = get_jwt_identity()['id']
        cart = Cart.query.filter_by(user_id=user_id).first()
        if cart:
            return cart_schema.dump(cart), 200
        return {"message": "Cart not found for this user"}, 404

    @jwt_required()
    def delete(self): # Removed cart_id, will delete current user's cart
        user_id = get_jwt_identity()['id']
        cart = Cart.query.filter_by(user_id=user_id).first()
        if cart:
            db.session.delete(cart)
            db.session.commit()
            return {}, 204
        return {"message": "Cart not found for this user"}, 404

class CartListResource(Resource):
    @jwt_required()
    def get(self): # Get all carts (Admin only?) - Consider if this is needed for regular users
        carts = Cart.query.all()
        return carts_schema.dump(carts), 200

    @jwt_required()
    def post(self): # Create a cart for the current user if one doesn't exist
        user_id = get_jwt_identity()['id']
        existing_cart = Cart.query.filter_by(user_id=user_id).first()
        if existing_cart:
            return cart_schema.dump(existing_cart), 200 # Or maybe 409 Conflict
        try:
            from datetime import datetime
            now = datetime.now()

            cart = Cart(
                user_id=user_id,
                updated_at=now
            )

            db.session.add(cart)
            db.session.commit()
            return cart_schema.dump(cart), 201
        except ValidationError as err:
            return {"errors": err.messages}, 400
        except KeyError as err:
            return {"errors": f"Missing required field: {err}"}, 400
        except Exception as e:
            db.session.rollback()
            print(f"Error creating cart: {str(e)}")
            return {"message": "Internal Server Error"}, 500

@cart_bp.route('/total', methods=['GET']) # Removed cart_id from the route, will use current user's cart
@jwt_required()
def calculate_cart_total():
    """
    Calculate the total price of items in the authenticated user's cart.
    """
    user_id = get_jwt_identity()['id']
    cart = Cart.query.filter_by(user_id=user_id).first_or_404()
    total_price = sum(
        (item.product.price if item.product else 0) * item.quantity
        for item in cart.items
    )
    cart.total_price = total_price
    db.session.commit()
    return jsonify({"cart_id": cart.id, "total_price": total_price}), 200

api.add_resource(CartListResource, '')
api.add_resource(CartResource, '') # Updated route to reflect changes