import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa'; // Importing the logout icon
import ShoppingCartIcon from '../Components/ShoppingCartIcon';
import './Navbar.css';
import { useDispatch } from 'react-redux';
import { performLogout } from '../redux/authActions';

const Navbar = ({ isLoggedIn }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const showNav = ['/home', '/products', '/about', '/services', '/logout'].includes(location.pathname);

  const handleLogout = () => {
    dispatch(performLogout());
    navigate('/login'); // Redirect to the client login page without state
  };

  const handleLogoutClick = () => {
    handleLogout(); // Call the logout function
  };

  if (!showNav) {
    return null;
  }

  return (
    <div>
      <nav className="nav">
        <div className="navigation">
          <div className="nav_header">
            <h2 className="nav_logo">
              Vetty Services
              <br />
            </h2>
          </div>
          <div className="links">
            <ul>
              <li>
                <Link to="/home" className={location.pathname === '/' || location.pathname === '/home' ? 'active' : ''}>HOME</Link>
              </li>
              <li>
                <Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>PRODUCTS</Link>
              </li>
              <li>
                <Link to="/services" className={location.pathname === '/services' ? 'active' : ''}>SERVICES</Link>
              </li>
              <li>
                <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>ABOUT</Link>
              </li>
              <li>
                <button onClick={handleLogoutClick} className="logout-button">
                  <FaSignOutAlt />
                </button>
              </li>
              {isLoggedIn && (
                <li>
                  <button onClick={handleLogoutClick}>Logout</button>
                </li>
              )}
              <li>
                <ShoppingCartIcon onClick={() => navigate('/cart')} />
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
