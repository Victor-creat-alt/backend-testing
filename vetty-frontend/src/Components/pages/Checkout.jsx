import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, clearCart } from '../../redux/cartSlice';
import { useNavigate } from 'react-router-dom';
import api from '../api/api'; // Import the shared Axios instance
import { formatCurrency } from '../../utils/currencyFormatter';
import './Checkout.css'; // Import improved CSS

const Checkout = () => {
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [servicesDetails, setServicesDetails] = useState({}); // service_id -> service details
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Fetch full service details for service items in cart only if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No auth token found, skipping service details fetch');
      return;
    }

    const serviceItems = cartItems.filter(item => item.service);
    const serviceIdsToFetch = serviceItems
      .map(item => item.service.service_id ?? item.service.id)
      .filter(id => id && !servicesDetails[id]);

    if (serviceIdsToFetch.length > 0) {
      Promise.all(
        serviceIdsToFetch.map(id =>
          api.get(`/services/${id}`) // Use shared Axios instance
            .then(response => ({ id, data: response.data }))
            .catch(error => {
              console.error(`Failed to fetch service details for ID ${id}:`, error);
              return null; // Allow other fetches to succeed
            })
        )
      ).then(results => {
        const newDetails = {};
        results.forEach(result => {
          if (result) {
            newDetails[result.id] = result.data;
          }
        });
        setServicesDetails(prev => ({ ...prev, ...newDetails }));
      });
    }
  }, [cartItems, servicesDetails]);

  useEffect(() => {
    console.log('cartItems changed:', cartItems);
    const newTotalPrice = cartItems.reduce((total, item) => {
      let price = 0;
      if (item.product?.price) {
        price = item.product.price;
      } else if (item.service) {
        const serviceId = item.service.service_id ?? item.service.id;
        const serviceDetails = serviceId ? servicesDetails[serviceId] : null;
        price = serviceDetails?.price ?? 0;
      }
      return total + price * item.quantity;
    }, 0);
    setTotalPrice(newTotalPrice);
    console.log('newTotalPrice:', newTotalPrice);
  }, [cartItems, servicesDetails]);

  const handleProceedToPayment = () => {
    if (cartItems.length > 0) {
      navigate('/payment');
    } else {
      alert('Your cart is empty. Please add items to proceed.');
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button onClick={() => navigate('/cart')} className="back-to-cart-button">
          &larr; Back to Cart
        </button>
        <h1 className="checkout-title">Checkout</h1>
      </div>
      {cartItems.length === 0 ? (
        <div className="empty-checkout">
          <p className="empty-checkout-message">Your cart is empty. Please add items to proceed.</p>
          <button onClick={() => navigate('/products')} className="continue-shopping-button">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="checkout-wrapper">
          <div className="checkout-summary">
            <h2 className="summary-heading">Order Summary</h2>
            <div className="checkout-items-grid">
              {cartItems.map((item) => {
                const serviceId = item.service?.service_id ?? item.service?.id;
                const serviceDetails = serviceId ? servicesDetails[serviceId] : null;

                const itemName = item.product?.name ?? serviceDetails?.name ?? 'Unknown Item';
                const itemPrice = item.product?.price ?? serviceDetails?.price ?? 0;
                const itemImage = item.product?.image_url ?? item.product?.imageUrl ?? serviceDetails?.image_url ?? serviceDetails?.imageUrl ?? '';

                return (
                  <div key={item.id} className="checkout-item-card">
                    <div className="checkout-item-image-container">
                      {itemImage ? (
                        <img src={itemImage} alt={itemName} className="checkout-item-image" />
                      ) : (
                        <div className="checkout-item-image-placeholder">No Image</div>
                      )}
                    </div>
                    <div className="checkout-item-details">
                      <h3>{itemName}</h3>
                      <p className="checkout-item-description">{item.product?.description || serviceDetails?.description || 'No description available.'}</p>
                      <p className="checkout-item-price">{formatCurrency(itemPrice)}</p>
                      <p className="checkout-item-quantity">Quantity: {item.quantity}</p>
                      <p className="checkout-item-subtotal">{formatCurrency(itemPrice * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="checkout-total">Total: {formatCurrency(totalPrice)}</p>
          </div>
          <div className="payment-section">
            <h2>Payment Details</h2>
            <button onClick={handleProceedToPayment} className="payment-button">
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
