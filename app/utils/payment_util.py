import requests
import base64
import os
import logging
from flask import jsonify

# Load environment variables
MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")
MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE")
MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")
MPESA_CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_mpesa_access_token():
    """
    Generate an access token for M-Pesa API.
    """
    url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    try:
        response = requests.get(url, auth=(MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET))
        if response.status_code != 200:
            logger.error(f"Failed to get access token, status code: {response.status_code}")
            return None
        response_data = response.json()
        return response_data.get("access_token")
    except Exception as e:
        logger.error(f"Exception while getting access token: {str(e)}")
        return None

def initiate_stk_push(phone_number, amount, account_reference, transaction_desc):
    """
    Initiate an STK Push request to M-Pesa API.
    """
    access_token = get_mpesa_access_token()
    if not access_token:
        logger.error("No access token available for STK push")
        raise Exception("Failed to get access token")

    url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {"Authorization": f"Bearer {access_token}"}

    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}".encode()).decode()

    payload = {
        "BusinessShortCode": MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": MPESA_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": MPESA_CALLBACK_URL,
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc,
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        logger.info(f"STK push request successful: {response.text}")
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"STK push request failed: {str(e)}")
        raise
