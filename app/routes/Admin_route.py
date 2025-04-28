from flask import Blueprint, request, jsonify
from app.models.User import User
from app.models.Order import Order
from app.models.Product import Product
from app import db
from app.utils.auth_util import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@admin_bp.route('/admin/orders', methods=['GET'])
@admin_required
def get_all_orders():
    orders = Order.query.all()
    return jsonify([order.to_dict() for order in orders]), 200

@admin_bp.route('/admin/products/<int:product_id>/stock', methods=['PUT'])
@admin_required
def update_stock(product_id):
    data = request.get_json()
    product = Product.query.get_or_404(product_id)
    product.stock_quantity = data.get('stock_quantity', product.stock_quantity)
    db.session.commit()
    return jsonify({'message': 'Stock updated successfully'}), 200

@admin_bp.route('/admin/stats/revenue', methods=['GET'])
@admin_required
def get_revenue_stats():
    total_revenue = db.session.query(db.func.sum(Order.total_price)).scalar()
    total_orders = Order.query.count()
    return jsonify({'total_revenue': total_revenue, 'total_orders': total_orders}), 200