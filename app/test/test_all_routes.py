import requests
import json

BASE_URL = "http://localhost:5000"  # Change to your backend URL

# Sample data for path parameters
# TODO: Replace these IDs with actual IDs from your test data or database
sample_ids = {
    "user_id": 1,  # Replace with actual user ID
    "product_id": 1,  # Replace with actual product ID
    "request_id": 1,  # Replace with actual service request ID
    "order_id": 1,  # Replace with actual order ID
}

# Credentials for login to get JWT token for ADMIN user
admin_login_credentials = {
    "email": "victorkihiko211@gmail.com",  # Updated with the correct admin email
    "password": "adminpassword"     # Updated with the correct admin password
}

# Credentials for a REGULAR user (for testing /users/{id} etc.)
regular_user_credentials = {
    "email": "testuser@example.com",  # Updated with the correct regular user email
    "password": "password123"     # Updated with the correct regular user password
}

# Store JWT token after admin login
admin_jwt_token = None
regular_jwt_token = None

def admin_login():
    global admin_jwt_token
    url = f"{BASE_URL}/auth/login"  # Note: login route is under /auth prefix
    response = requests.post(url, json=admin_login_credentials)
    if response.status_code == 200:
        admin_jwt_token = response.json().get("access_token")
        print("Admin login successful, JWT token obtained.")
    else:
        print(f"Admin login failed: {response.status_code} - {response.text}")

def regular_user_login():
    global regular_jwt_token
    url = f"{BASE_URL}/auth/login"  # Note: login route is under /auth prefix
    response = requests.post(url, json=regular_user_credentials)
    if response.status_code == 200:
        regular_jwt_token = response.json().get("access_token")
        print("Regular user login successful, JWT token obtained.")
    else:
        print(f"Regular user login failed: {response.status_code} - {response.text}")

def make_request(method, url, data=None, auth_token=None):
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            print(f"Unsupported method: {method}")
            return
        print(f"{method} {url} -> Status: {response.status_code}")
        if response.status_code >= 400:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error making request to {url}: {str(e)}")

def test_routes():
    # Login as admin first to get JWT token for admin routes
    admin_login()

    # Login as a regular user for user-specific authenticated routes
    regular_user_login()

    # Create a test user for OTP verification (if not already existing)
    test_user_data = {
        "username": "testuser_otp",
        "email": "testuser_otp@example.com",  # Ensure this is a unique email for testing OTP
        "password": "testpassword_otp"
    }
    make_request("POST", f"{BASE_URL}/users", test_user_data)

    # Simulate OTP retrieval (you'll need to find the actual OTP)
    # This is a placeholder - replace with your actual OTP retrieval method
    correct_otp = "ACTUAL_GENERATED_OTP"  # *** REPLACE WITH THE CORRECT OTP ***

    # Simulate password reset request for a test user
    password_reset_email = "testuser@example.com" # Updated to use existing user email
    make_request("POST", f"{BASE_URL}/users/password-reset-request", {"email": password_reset_email})
    # You would then need to retrieve the generated reset token (e.g., from an email or database)
    valid_reset_token = "VALID_RESET_TOKEN_FROM_EMAIL_OR_DB" # *** REPLACE WITH A VALID RESET TOKEN ***

    # List of routes to test: (method, path, auth_required, sample_data, token_type)
    routes = [
        # Admin routes (require admin role and admin JWT token)
        ("GET", "/admin/users", True, None, "admin"),
        ("GET", "/admin/orders", True, None, "admin"),
        ("PUT", f"/admin/products/{sample_ids['product_id']}/stock", True, {"stock_quantity": 10}, "admin"),
        ("PUT", f"/admin/products/{sample_ids['product_id']}", True, {
            "name": "Updated Product",
            "description": "Updated description",
            "price": 99.99,
            "discount": 5,
            "category": "Updated Category",
            "stock_quantity": 20,
            "image_url": "http://example.com/image.jpg"
        }, "admin"),
        ("GET", "/admin/stats/revenue", True, None, "admin"),
        ("PUT", f"/admin/service_requests/{sample_ids['request_id']}/approve", True, None, "admin"),
        ("PUT", f"/admin/service_requests/{sample_ids['request_id']}/disapprove", True, None, "admin"),
        ("PUT", f"/admin/orders/{sample_ids['order_id']}/approve", True, None, "admin"),
        ("PUT", f"/admin/orders/{sample_ids['order_id']}/disapprove", True, None, "admin"),

        # User routes (require user JWT token for specific user, no auth for list/create)
        ("GET", f"/users/{sample_ids['user_id']}", True, None, "regular"),
        ("PUT", f"/users/{sample_ids['user_id']}", True, {"username": "newusername"}, "regular"),
        ("DELETE", f"/users/{sample_ids['user_id']}", True, None, "regular"),
        ("GET", "/users", False, None, None),
        ("POST", "/users", False, {
            "username": "another_test_user",
            "email": "another_test@example.com",
            "password": "another_test_password"
        }, None),
        ("POST", "/users/verify-otp", False, {
            "email": "testuser_otp@example.com",
            "otp": correct_otp  # Use the actual OTP here
        }, None),
        ("POST", "/auth/login", False, regular_user_credentials, None),
        ("POST", "/users/password-reset-request", False, {
            "email": password_reset_email
        }, None),
        ("POST", "/users/password-reset-confirm", False, {
            "token": valid_reset_token,  # Use a valid reset token here
            "new_password": "new_secure_password"
        }, None),

        # Cart routes
        ("GET", "/cart", True, None, "regular"),
        ("POST", "/cart", True, None, "regular"),
        ("DELETE", "/cart", True, None, "regular"),

        # CartItem routes
        ("POST", "/cart/items", True, {
            "product_id": sample_ids["product_id"],
            "quantity": 1
        }, "regular"),
        # For CartItemResource routes, we need an item_id, so we will test only POST here for simplicity

        # Payment routes
        ("POST", "/payments/mpesa", False, {
            "phone_number": "254700000000",
            "amount": 100,
            "account_reference": "TestRef",
            "transaction_desc": "Test payment",
            "order_id": sample_ids["order_id"]
        }, None),
        ("POST", "/payments/mpesa/callback", False, {
            "Body": {
                "stkCallback": {
                    "ResultCode": 0,
                    "CheckoutRequestID": "test_checkout_request_id"
                }
            }
        }, None),
    ]

    for method, path, auth_required, data, token_type in routes:
        url = BASE_URL + path
        auth_token_to_use = None
        if auth_required:
            if token_type == "admin":
                auth_token_to_use = admin_jwt_token
            elif token_type == "regular":
                auth_token_to_use = regular_jwt_token
            else:
                print(f"Warning: Auth required for {path} but no token type specified.")
        make_request(method, url, data, auth_token_to_use)

if __name__ == "__main__":
    test_routes()
