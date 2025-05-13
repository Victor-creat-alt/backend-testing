import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    navigate('/home');
  };

  return (
    <div className="payment-success-container">
      <FaCheckCircle size={100} color="green" />
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase. Your payment has been processed successfully.</p>
      <button onClick={handleContinueShopping}>Continue Shopping</button>
    </div>
  );
};

export default PaymentSuccess;
