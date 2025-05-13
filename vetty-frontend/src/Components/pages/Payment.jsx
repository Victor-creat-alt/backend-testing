import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart, selectCartItems } from '../../redux/cartSlice';
import { FaMobileAlt, FaArrowLeft } from 'react-icons/fa';
import { formatCurrency } from '../../utils/currencyFormatter';
import '../../Components/pages/Payment.css'; // Ensure this path is correct
import Input from '../ui/Input'; // Ensure this path is correct

const Payment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const totalPrice = cartItems.reduce((total, item) => {
    const price = item.product?.price ?? item.service?.price ?? 0;
    return total + price * item.quantity;
  }, 0);

  const [formData, setFormData] = useState({
    phone_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (totalPrice <= 0) {
      setError('Your cart is empty. Cannot proceed with payment.');
      setLoading(false);
      return;

    if (!formData.phone_number) {
      setError('Phone number is required.');
      setLoading(false);
      return;
    }
    }

    try {
      const response = await fetch('/payments/mpesa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phone_number,
          amount: totalPrice,
          order_id: formData.order_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Payment failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccessMessage('Payment initiated successfully! Please complete the payment on your phone.');
      dispatch(clearCart());
      setTimeout(() => {
        navigate('/payment-success');
      }, 3000);
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <button onClick={() => navigate('/checkout')} className="back-button">
          <FaArrowLeft /> Back to Checkout
        </button>
        <h2 className="payment-title">Payment</h2>
        <p className="payment-total">
          Total amount to pay: <span className="total-price">{formatCurrency(totalPrice)}</span>
        </p>

        <form className="form" onSubmit={handlePay}>
          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <div className="inputGroup">
            <Input
              type="tel"
              id="phone_number"
              name="phone_number"
              placeholder="Enter your M-Pesa phone number"
              value={formData.phone_number}
              onChange={handleChange}
              required
            />
            <FaMobileAlt className="icon" />
          </div>

          

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Processing Payment...' : `Pay ${formatCurrency(totalPrice)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
