import logging
import logging
from flask import Blueprint, request, jsonify
from app.utils.payment_util import initiate_stk_push
from app import db
from app.models.Payment import Payment
from app.models.Order import Order # Import Order model
from flask_jwt_extended import jwt_required, get_jwt_identity # Import JWT tools

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

payment_bp = Blueprint('payment', __name__, url_prefix='/payments')

@payment_bp.route('/mpesa', methods=['POST'])
@jwt_required() # Protect the endpoint
def mpesa_payment():
    """
    Handle M-Pesa payment initiation.
    """
    try:
        current_user = get_jwt_identity()
        user_id = current_user['id']

        data = request.get_json()
        phone_number = data.get("phone_number")
        amount = data.get("amount")
        order_id = data.get("order_id")
        account_reference = data.get("account_reference", "VETTY")
        transaction_desc = data.get("transaction_desc", "Payment for services")

        if not phone_number or not amount:
            logger.error("Phone number and amount are required")
            return jsonify({"error": "Phone number and amount are required"}), 400

        if not order_id:
            logger.error("order_id is required")
            return jsonify({"error": "order_id is required"}), 400

        # Validate order existence and ownership
        order = Order.query.filter_by(id=order_id, user_id=user_id).first()
        if not order:
            logger.error(f"Order with id {order_id} does not exist for user {user_id}")
            return jsonify({"error": f"Order with id {order_id} not found or access denied"}), 404 # Or 403

        try:
            response = initiate_stk_push(phone_number, amount, account_reference, transaction_desc)
        except Exception as e:
            logger.error(f"Failed to initiate STK push: {str(e)}")
            return jsonify({"error": "Failed to initiate payment", "details": str(e)}), 500

        # Save payment details to the database
        payment = Payment(
            order_id=order_id,
            payment_method="m-pesa",
            amount=amount,
            status="pending",
            transaction_id=response.get("CheckoutRequestID"),
        )
        try:
            db.session.add(payment)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to save payment: {str(e)}")
            return jsonify({"error": "Failed to save payment", "details": str(e)}), 500

        return jsonify({"message": "Payment initiated", "response": response}), 200
    except Exception as e:
        logger.error(f"Unexpected error in mpesa_payment: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500

@payment_bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """
    Handle M-Pesa callback for payment status.
    """
    try:
        data = request.get_json()
        result_code = data.get("Body", {}).get("stkCallback", {}).get("ResultCode")
        checkout_request_id = data.get("Body", {}).get("stkCallback", {}).get("CheckoutRequestID")

        payment = Payment.query.filter_by(transaction_id=checkout_request_id).first()
        if not payment:
            logger.error(f"Payment not found for transaction_id: {checkout_request_id}")
            return jsonify({"error": "Payment not found"}), 404

        if result_code == 0:
            payment.status = "completed"
        else:
            payment.status = "failed"

        db.session.commit()
        logger.info(f"Payment status updated to {payment.status} for transaction_id: {checkout_request_id}")
        return jsonify({"message": "Payment status updated"}), 200
    except Exception as e:
        logger.error(f"Unexpected error in mpesa_callback: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500
