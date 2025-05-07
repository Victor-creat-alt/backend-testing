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
    data = request.get_json()
    phone_number = data.get("phone_number")
    amount = data.get("amount")
    account_reference = data.get("account_reference", "VETTY")
    transaction_desc = data.get("transaction_desc", "Payment for services")

    if not phone_number or not amount:
        return jsonify({"error": "Phone number and amount are required"}), 400

    response = initiate_stk_push(phone_number, amount, account_reference, transaction_desc)

    # Save payment details to the database
    payment = Payment(
        order_id=data.get("order_id"),
        payment_method="m-pesa",
        amount=amount,
        status="pending",
        transaction_id=response.get("CheckoutRequestID"),
    )
    db.session.add(payment)
    db.session.commit()

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