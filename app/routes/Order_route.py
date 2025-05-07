from flask import Blueprint, request
from flask_restful import Api, Resource
from marshmallow import ValidationError
from app import db
from app.models.Order import Order
from app.models.OrderItem import OrderItem
from app.schemas.Order_schemas import OrderSchema
from app.schemas.Orderitem_schemas import OrderItemSchema
from flask_jwt_extended import jwt_required, get_jwt_identity

order_bp = Blueprint('order', __name__, url_prefix='/orders')
api = Api(order_bp)

order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)
order_item_schema = OrderItemSchema()
order_items_schema = OrderItemSchema(many=True)

class OrderResource(Resource):
    @jwt_required()
    def get(self, order_id):
        """
        Get a specific order by ID.
        """
        order = db.session.get(Order, order_id)
        if order is None:
            return {"error": "Order not found"}, 404
        current_user = get_jwt_identity()
        if order.user_id != current_user["id"]:
            return {"error": "Unauthorized"}, 403
        return order_schema.dump(order), 200

    @jwt_required()
    def put(self, order_id):
        """
        Update an existing order.
        """
        order = db.session.get(Order, order_id)
        if order is None:
            return {"error": "Order not found"}, 404
        current_user = get_jwt_identity()
        if order.user_id != current_user["id"]:
            return {"error": "Unauthorized"}, 403
        data = request.get_json()
        try:
            order_schema.load(data, instance=order, partial=True)
        except ValidationError as err:
            return {"errors": err.messages}, 400
        db.session.commit()
        return order_schema.dump(order), 200

    @jwt_required()
    def delete(self, order_id):
        """
        Delete an order by ID.
        """
        order = db.session.get(Order, order_id)
        if order is None:
            return {"error": "Order not found"}, 404
        current_user = get_jwt_identity()
        if order.user_id != current_user["id"]:
            return {"error": "Unauthorized"}, 403
        db.session.delete(order)
        db.session.commit()
        return {}, 204

class OrderListResource(Resource):
    @jwt_required()
    def get(self):
        """
        Get all orders for the authenticated user.
        """
        current_user = get_jwt_identity()
        orders = Order.query.filter_by(user_id=current_user["id"]).all()
        return orders_schema.dump(orders), 200

    @jwt_required()
    def post(self):
        """
        Create a new order.
        """
        data = request.get_json()
        current_user = get_jwt_identity()

        # Calculate total_price from items if not provided
        items = data.get("items", [])
        total_price = data.get("total_price")
        if total_price is None:
            total_price = 0.0
            for item in items:
                quantity = item.get("quantity", 0)
                unit_price = item.get("unit_price", 0.0)
                total_price += quantity * unit_price

        # Validate and create the order
        try:
            order_data = {
                "user_id": current_user["id"],
                "total_price": total_price,
                "status": "pending"
            }
            order = order_schema.load(order_data)
            db.session.add(order)
            db.session.flush()  # Flush to get the order ID for order items

            # Add order items
            for item in items:
                item["order_id"] = order.id
                order_item = order_item_schema.load(item)
                db.session.add(order_item)

            db.session.commit()
            # Refresh order from DB to avoid detached instance issues
            db.session.refresh(order)
            return order_schema.dump(order), 201
        except ValidationError as err:
            db.session.rollback()
            return {"errors": err.messages}, 400

class OrderItemResource(Resource):
    @jwt_required()
    def get(self, order_id):
        """
        Get all items for a specific order.
        """
        order = db.session.get(Order, order_id)
        if order is None:
            return {"error": "Order not found"}, 404
        current_user = get_jwt_identity()
        if order.user_id != current_user["id"]:
            return {"error": "Unauthorized"}, 403
        order_items = OrderItem.query.filter_by(order_id=order_id).all()
        return order_items_schema.dump(order_items), 200

from flask_jwt_extended import jwt_required

class OrderStatusResource(Resource):
    @jwt_required()
    def put(self, order_id):
        order = db.session.get(Order, order_id)
        if order is None:
            return {"error": "Order not found"}, 404
        # Only allow admin to change order status
        current_user = get_jwt_identity()
        if current_user["role"] != "Admin":
            return {"error": "Admin role required to update order status"}, 403
        data = request.get_json()
        status = data.get('status')
        if not status:
            return {"error": "Status is required"}, 400
        order.status = status
        db.session.commit()
        return {"message": "Order status updated successfully"}, 200

api.add_resource(OrderListResource, '')
api.add_resource(OrderResource, '/<int:order_id>')
api.add_resource(OrderItemResource, '/<int:order_id>/items')
api.add_resource(OrderStatusResource, '/<int:order_id>/status')
