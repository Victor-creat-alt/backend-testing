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

            # Recalculate and update cart total_price
            cart = cart_item.cart
            total_price = sum(
                (item.product.price if item.product else 0) * item.quantity
                + (item.service.price if item.service else 0) * item.quantity
                for item in cart.items
            )
            cart.total_price = total_price
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
            cart = cart_item.cart
            db.session.delete(cart_item)
            db.session.commit()

            # Recalculate and update cart total_price
            total_price = sum(
                (item.product.price if item.product else 0) * item.quantity
                + (item.service.price if item.service else 0) * item.quantity
                for item in cart.items
            )
            cart.total_price = total_price
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
            print(f"Received cart item data: {data}")
            
            user_id = get_jwt_identity()['id']
            print(f"User ID from JWT: {user_id}")
            
            cart = Cart.query.filter_by(user_id=user_id).first()
            if not cart:
                print(f"Creating new cart for user {user_id}")
                cart = Cart(user_id=user_id)
                db.session.add(cart)
                db.session.commit()
            else:
                print(f"Found existing cart ID {cart.id} for user {user_id}")

            # Validate required fields
            if 'quantity' not in data:
                print("Validation error: quantity is required")
                return {"error": "quantity is required"}, 400
                
            if 'product_id' not in data and 'service_id' not in data:
                print("Validation error: Either product_id or service_id is required")
                return {"error": "Either product_id or service_id is required"}, 400
            
            # Check if product exists if product_id is provided
            if 'product_id' in data:
                from app.models.Product import Product
                product = Product.query.get(data['product_id'])
                if not product:
                    print(f"Product with ID {data['product_id']} not found")
                    return {"error": f"Product with ID {data['product_id']} not found"}, 404
                print(f"Found product: {product.name}")
            
            # Check if service exists if service_id is provided
            if 'service_id' in data:
                from app.models.Service import Service
                service = Service.query.get(data['service_id'])
                if not service:
                    print(f"Service with ID {data['service_id']} not found")
                    return {"error": f"Service with ID {data['service_id']} not found"}, 404
                print(f"Found service: {service.name}")

            # Prepare data for schema validation
            cart_item_data = {
                "cart_id": cart.id,
                "product_id": data.get('product_id'),
                "service_id": data.get('service_id'),
                "quantity": data['quantity']
            }
            print(f"Preparing cart item data for validation: {cart_item_data}")

            try:
                # Use schema load for validation
                cart_item = cart_item_schema.load(cart_item_data)
                print(f"Cart item validated successfully")
            except ValidationError as err:
                print(f"Schema validation error: {err.messages}")
                return {"errors": err.messages}, 400

            db.session.add(cart_item)
            db.session.commit()
            print(f"Added cart item ID {cart_item.id} to database")

            # Recalculate and update cart total_price
            total_price = sum(
                (item.product.price if item.product else 0) * item.quantity
                + (item.service.price if item.service else 0) * item.quantity
                for item in cart.items
            )
            cart.total_price = total_price
            db.session.commit()
            print(f"Updated cart total price to {total_price}")

            return cart_item_schema.dump(cart_item), 201
        except ValidationError as err:
            db.session.rollback()
            print(f"Validation error: {err.messages}")
            return {"errors": err.messages}, 400
        except Exception as e:
            db.session.rollback()
            print(f"Error adding item to cart: {str(e)}")
            return {"error": f"Error adding item to cart: {str(e)}"}, 500

api.add_resource(CartItemListResource, '')
api.add_resource(CartItemResource, '/<int:item_id>')
