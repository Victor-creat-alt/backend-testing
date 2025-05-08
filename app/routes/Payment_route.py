from flask import Blueprint, request, jsonify
from app.utils.payment_util import initiate_stk_push
from app import db
from app.models.Payment import Payment

payment_bp = Blueprint('payment', __name__, url_prefix='/payments')

@payment_bp.route('/mpesa', methods=['POST'])
def mpesa_payment():
    """
    Handle M-Pesa payment initiation.
    """
    import logging
    data = request.get_json()
    phone_number = data.get("phone_number")
    amount = data.get("amount")
    order_id = data.get("order_id")
    account_reference = data.get("account_reference", "VETTY")
    transaction_desc = data.get("transaction_desc", "Payment for services")

    if not phone_number or not amount:
        logging.error("Phone number and amount are required")
        return jsonify({"error": "Phone number and amount are required"}), 400

    if not order_id:
        logging.error("order_id is required")
        return jsonify({"error": "order_id is required"}), 400

    # Validate order existence
    from app.models.Order import Order
    order = Order.query.get(order_id)
    if not order:
        logging.error(f"Order with id {order_id} does not exist")
        return jsonify({"error": f"Order with id {order_id} does not exist"}), 400

    try:
        response = initiate_stk_push(phone_number, amount, account_reference, transaction_desc)
    except Exception as e:
        logging.error(f"Failed to initiate STK push: {str(e)}")
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
        logging.error(f"Failed to save payment: {str(e)}")
        return jsonify({"error": "Failed to save payment", "details": str(e)}), 500

    return jsonify({"message": "Payment initiated", "response": response}), 200

@payment_bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """
    Handle M-Pesa callback for payment status.
    """
    data = request.get_json()
    result_code = data.get("Body", {}).get("stkCallback", {}).get("ResultCode")
    checkout_request_id = data.get("Body", {}).get("stkCallback", {}).get("CheckoutRequestID")

    payment = Payment.query.filter_by(transaction_id=checkout_request_id).first()
    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    if result_code == 0:
        payment.status = "completed"
    else:
        payment.status = "failed"

    db.session.commit()
    return jsonify({"message": "Payment status updated"}), 200