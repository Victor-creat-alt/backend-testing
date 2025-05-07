from .Admin_route import admin_bp
from .Auth_route import auth_bp
from .Cart_route import cart_bp
from .CartItem_route import cart_item_bp
from .Product_route import product_bp
from .Payment_route import payment_bp
from .Order_route import order_bp
from .ServiceRequest_route import service_request_bp
from .User_route import user_bp
from .Service_route import service_bp

__all__ = [
    "user_bp",
    "product_bp",
    "service_bp",
    "cart_bp",
    "cart_item_bp",
    "order_bp",
    "service_request_bp",
    "admin_bp",
    "auth_bp",
    "payment_bp"
]
##in working