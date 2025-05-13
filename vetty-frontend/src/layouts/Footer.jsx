import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const showFooter = ['/home', '/products', '/about', '/services'].includes(location.pathname);

  if (!showFooter) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="grid">
          {/* Company Info */}
          <div className="company-info">
            <h3>Vetty</h3>
            <p>
              Your one-stop shop for all pet needs. Quality products and services for your beloved companions.
              We are dedicated to providing the best for your furry, scaly, and feathered friends.
            </p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook" className="social-link">
                <FaFacebookF />
              </a>
              <a href="#" aria-label="Twitter" className="social-link">
                <FaTwitter />
              </a>
              <a href="#" aria-label="Instagram" className="social-link">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="quick-links">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/products" className="link">Products</Link>
              </li>
              <li>
                <Link to="/services" className="link">Services</Link>
              </li>
              <li>
                <Link to="/about" className="link">About Us</Link>
              </li>
              <li>
                <Link to="/login" className="link">My Account</Link>
              </li>
              <li>
                <Link to="/contact" className="link">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="categories">
            <h3>Categories</h3>
            <ul>
              <li>
                <Link to="/products?category=food" className="link">Pet Food</Link>
              </li>
              <li>
                <Link to="/products?category=medicine" className="link">Medicines</Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="link">Accessories</Link>
              </li>
              <li>
                <Link to="/products?category=toys" className="link">Toys</Link>
              </li>
              <li>
                <Link to="/services?type=grooming" className="link">Grooming Services</Link>
              </li>
              <li>
                <Link to="/services?type=training" className="link">Training Services</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <h3>Contact Us</h3>
            <ul>
              <li>
                <FaMapMarkerAlt className="icon" />
                <span>123 Pet Street, Animal City, 12345, Pridelands, Machakos County, Kenya</span>
              </li>
              <li>
                <FaPhone className="icon" />
                <span>+254 700 000 000</span>
              </li>
              <li>
                <FaEnvelope className="icon" />
                <span>info@vetty.co.ke</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} Vetty. All rights reserved. Located in the beautiful Pridelands, Kenya.</p>
            <div className="footer-links">
              <Link to="/privacy-policy" className="link">Privacy Policy</Link>
              <Link to="/terms-of-service" className="link">Terms of Service</Link>
              <Link to="/shipping-policy" className="link">Shipping Policy</Link>
              <Link to="/returns-policy" className="link">Returns Policy</Link>
            </div>
          </div>
          <div className="footer-credit">
            <p>
              Made with <FaHeart className="heart-icon" /> for pet lovers everywhere in Pridelands
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
