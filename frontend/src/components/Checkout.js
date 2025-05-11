import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, clearCart } from '../redux/cartSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const totalPrice = cartItems.reduce((total, item) => {
    const price = item.product ? item.product.price : item.service ? item.service.price : 0;
    return total + price * item.quantity;
  }, 0);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Create order
      const orderItems = cartItems.map((item) => ({
        product_id: item.product ? item.product.id : undefined,
        service_id: item.service ? item.service.id : undefined,
        quantity: item.quantity,
        unit_price: item.product ? item.product.price : item.service ? item.service.price : 0,
      }));

      const orderResponse = await axios.post('/orders', {
        items: orderItems,
        total_price: totalPrice,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const orderId = orderResponse.data.id;

      // Initiate payment via M-Pesa
      const paymentResponse = await axios.post('/payments/mpesa', {
        phone_number: phoneNumber,
        amount: totalPrice,
        order_id: orderId,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setSuccessMessage('Payment initiated successfully. Please complete the payment on your phone.');
      dispatch(clearCart());
      navigate('/orders'); // Redirect to orders page or confirmation page
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return <div className="p-4 text-center">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <div className="mb-4">
        <label htmlFor="phone" className="block mb-1 font-semibold">Phone Number (for M-Pesa payment):</label>
        <input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="+2547XXXXXXXX"
        />
      </div>
      <div className="mb-4 text-lg font-semibold">Total: ${totalPrice.toFixed(2)}</div>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {successMessage && <div className="mb-4 text-green-600">{successMessage}</div>}
      <button
        onClick={handlePayment}
        disabled={loading || !phoneNumber}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

export default Checkout;
