import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import './VerificationSuccess.css';

const VerificationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const type = location.state?.type || 'emailVerification';

  const message =
    type === 'resetPassword'
      ? 'Thank you for resetting your password!'
      : 'Thank you for verifying your email!';

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="verification-success-container">
      <div className="form-box verification-success">
        <FaCheckCircle className="tick-icon" />
        <h1>{message}</h1>
        <button onClick={handleGoToLogin}>Go to Login</button>
      </div>
    </div>
  );
};

export default VerificationSuccess;
