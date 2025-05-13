import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogOut = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    sessionStorage.clear();

    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="logout-container">
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default LogOut;
