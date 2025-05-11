from flask import Blueprint, request, jsonify
from app.models.User import User
from app.models.Order import Order
from app.models.Product import Product
from app.models.Service_request import ServiceRequest
from app import db
from app.utils.auth_util import role_required
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from flask_jwt_extended.exceptions import NoAuthorizationError
from functools import wraps

admin_bp = Blueprint('admin', __name__)

import json

def admin_role_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            claims = get_jwt()
            print(f"JWT claims: {claims}")  # Debug log
            identity = claims.get("sub", {})
            if isinstance(identity, str):
                identity = json.loads(identity)
            print(f"Identity extracted from claims: {identity}")  # Debug log
            if not identity or identity.get("role") != "Admin":
                print("Admin role check failed")  # Debug log
                return jsonify({"error": "Admin access required"}), 403
        except NoAuthorizationError:
            return jsonify({"error": "Authorization token required"}), 401
        return fn(*args, **kwargs)
    return wrapper


@admin_bp.route('/admin/users', methods=['GET'])
@admin_role_required
def get_all_users():
    """
    Get all users in the system (Admin only).
    """
    users = User.query.all()
    return jsonify([{
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at
    } for user in users]), 200

@admin_bp.route('/admin/orders', methods=['GET'])
@admin_role_required
def get_all_orders():
    """
    Get all orders in the system (Admin only).
    """
    try:
        orders = Order.query.all()
        return jsonify([{
            "id": order.id,
            "user_id": order.user_id,
            "total_price": order.total_price,
            "status": order.status,
            "created_at": order.created_at
        } for order in orders]), 200
    except Exception as e:
        print(f"Error fetching orders: {str(e)}")
        return jsonify({"error": "Failed to fetch orders"}), 500

@admin_bp.route('/admin/products/<int:product_id>/stock', methods=['PUT'])
@admin_role_required
def update_stock(product_id):
    """
    Update the stock quantity of a product (Admin only).
    """
    data = request.get_json()
    product = Product.query.get_or_404(product_id)
    if "stock_quantity" not in data:
        return jsonify({"error": "stock_quantity is required"}), 400

    product.stock_quantity = data["stock_quantity"]
    db.session.commit()
    return jsonify({"message": "Stock updated successfully", "product_id": product.id, "stock_quantity": product.stock_quantity}), 200

@admin_bp.route('/admin/products/<int:product_id>', methods=['PUT'])
@admin_role_required
def update_product(product_id):
    """
    Update the details of a specific product (Admin only).
    """
    data = request.get_json()
    product = Product.query.get_or_404(product_id)

    # Update product fields if provided in the request
    product.name = data.get("name", product.name)
    product.description = data.get("description", product.description)
    product.price = data.get("price", product.price)
    product.discount = data.get("discount", product.discount)
    product.category = data.get("category", product.category)
    product.stock_quantity = data.get("stock_quantity", product.stock_quantity)
    product.image_url = data.get("image_url", product.image_url)

    db.session.commit()
    return jsonify({
        "message": "Product updated successfully",
        "product_id": product.id,
        "updated_product": {
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "discount": product.discount,
            "category": product.category,
            "stock_quantity": product.stock_quantity,
            "image_url": product.image_url
        }
    }), 200

@admin_bp.route('/admin/stats/revenue', methods=['GET'])
@admin_role_required
def get_revenue_stats():
    """
    Get revenue statistics (Admin only).
    """
    total_revenue = db.session.query(db.func.sum(Order.total_price)).scalar() or 0
    total_orders = Order.query.count()
    return jsonify({
        "total_revenue": total_revenue,
        "total_orders": total_orders
    }), 200

@admin_bp.route('/admin/service_requests/<int:request_id>/approve', methods=['PUT'])
@admin_bp.route('/admin/service_requests/<int:request_id>/approve/', methods=['PUT'])
@admin_role_required
def approve_service_request(request_id):
    """
    Approve a service request (Admin only).
    """
    print(f"Approving service request with id={request_id}")
    service_request = ServiceRequest.query.get_or_404(request_id)
    service_request.status = "approved"
    db.session.commit()
    print(f"Service request {request_id} approved")
    return jsonify({"message": "Service request approved successfully"}), 200

@admin_bp.route('/admin/service_requests/<int:request_id>/disapprove', methods=['PUT'])
@admin_bp.route('/admin/service_requests/<int:request_id>/disapprove/', methods=['PUT'])
@admin_role_required
def disapprove_service_request(request_id):
    """
    Disapprove a service request (Admin only).
    """
    print(f"Disapproving service request with id={request_id}")
    service_request = ServiceRequest.query.get_or_404(request_id)
    service_request.status = "disapproved"
    db.session.commit()
    print(f"Service request {request_id} disapproved")
    return jsonify({"message": "Service request disapproved successfully"}), 200

@admin_bp.route('/admin/orders/<int:order_id>/approve', methods=['PUT'])
@admin_bp.route('/admin/orders/<int:order_id>/approve/', methods=['PUT'])
@admin_role_required
def approve_order(order_id):
    """
    Approve a product order (Admin only).
    """
    print(f"Approving order with id={order_id}")
    order = Order.query.get_or_404(order_id)
    order.status = "approved"
    db.session.commit()
    print(f"Order {order_id} approved")
    return jsonify({"message": "Order approved successfully"}), 200

@admin_bp.route('/admin/orders/<int:order_id>/disapprove', methods=['PUT'])
@admin_bp.route('/admin/orders/<int:order_id>/disapprove/', methods=['PUT'])
@admin_role_required
def disapprove_order(order_id):
    """
    Disapprove a product order (Admin only).
    """
    print(f"Disapproving order with id={order_id}")
    order = Order.query.get_or_404(order_id)
    order.status = "disapproved"
    db.session.commit()
    print(f"Order {order_id} disapproved")
    return jsonify({"message": "Order disapproved successfully"}), 200

@admin_bp.route('/admin/service_requests', methods=['GET'])
@admin_role_required
def get_all_service_requests():
    """
    Get all service requests in the system (Admin only).
    """
    try:
        service_requests = ServiceRequest.query.all()
        return jsonify([{
            "id": sr.id,
            "user_id": sr.user_id,
            "service_id": sr.service_id,
            "status": sr.status,
            "appointment_time": sr.appointment_time,
            "created_at": sr.created_at
        } for sr in service_requests]), 200
    except Exception as e:
        print(f"Error fetching service requests: {str(e)}")
        return jsonify({"error": "Failed to fetch service requests"}), 500

# CRUD routes for order items
from app.models.OrderItem import OrderItem
from app.schemas.Orderitem_schemas import OrderItemSchema

order_item_schema = OrderItemSchema()
order_items_schema = OrderItemSchema(many=True)

@admin_bp.route('/admin/orders/<int:order_id>/items', methods=['GET'])
@admin_role_required
def get_order_items(order_id):
    """
    Get all order items for a specific order (Admin only).
    """
    try:
        order_items = OrderItem.query.filter_by(order_id=order_id).all()
        return jsonify(order_items_schema.dump(order_items)), 200
    except Exception as e:
        print(f"Error fetching order items for order {order_id}: {str(e)}")
        return jsonify({"error": "Failed to fetch order items"}), 500

@admin_bp.route('/admin/orders/<int:order_id>/items', methods=['POST'])
@admin_role_required
def create_order_item(order_id):
    """
    Create a new order item for a specific order (Admin only).
    """
    try:
        data = request.get_json()
        data['order_id'] = order_id
        order_item = order_item_schema.load(data)
        db.session.add(order_item)
        db.session.commit()
        return jsonify(order_item_schema.dump(order_item)), 201
    except Exception as e:
        print(f"Error creating order item for order {order_id}: {str(e)}")
        return jsonify({"error": "Failed to create order item"}), 500

@admin_bp.route('/admin/orders/<int:order_id>/items/<int:item_id>', methods=['PUT'])
@admin_role_required
def update_order_item(order_id, item_id):
    """
    Update an existing order item for a specific order (Admin only).
    """
    try:
        order_item = OrderItem.query.filter_by(order_id=order_id, id=item_id).first_or_404()
        data = request.get_json()
        for key, value in data.items():
            setattr(order_item, key, value)
        db.session.commit()
        return jsonify(order_item_schema.dump(order_item)), 200
    except Exception as e:
        print(f"Error updating order item {item_id} for order {order_id}: {str(e)}")
        return jsonify({"error": "Failed to update order item"}), 500

@admin_bp.route('/admin/orders/<int:order_id>/items/<int:item_id>', methods=['DELETE'])
@admin_role_required
def delete_order_item(order_id, item_id):
    """
    Delete an order item for a specific order (Admin only).
    """
    try:
        order_item = OrderItem.query.filter_by(order_id=order_id, id=item_id).first_or_404()
        db.session.delete(order_item)
        db.session.commit()
        return jsonify({"message": "Order item deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting order item {item_id} for order {order_id}: {str(e)}")
        return jsonify({"error": "Failed to delete order item"}), 500
