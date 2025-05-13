import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectCartItems } from '../redux/cartSlice';

const ShoppingCartIcon = ({ onClick }) => {
  const cartItems = useSelector(selectCartItems);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      onClick={onClick}
      style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label="Open shopping cart"
      onKeyPress={(e) => {
        if (e.key === 'Enter') onClick();
      }}
    >
      <FaShoppingCart size={24} />
      {totalQuantity > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '12px',
            fontWeight: 'bold',
            lineHeight: 1,
            minWidth: '20px',
            textAlign: 'center',
          }}
        >
          {totalQuantity}
        </span>
      )}
    </div>
  );
};

export default ShoppingCartIcon;
