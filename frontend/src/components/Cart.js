import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, updateItemQuantity, removeItemFromCart, clearCart } from '../redux/cartSlice';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleQuantityChange = (id, type, quantity) => {
    if (quantity < 1) return;
    dispatch(updateItemQuantity({ id, type, quantity }));
  };

  const handleRemove = (id, type) => {
    dispatch(removeItemFromCart({ id, type }));
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const totalPrice = cartItems.reduce((total, item) => {
    const price = item.product ? item.product.price : item.service ? item.service.price : 0;
    return total + price * item.quantity;
  }, 0);

  if (cartItems.length === 0) {
    return <div className="p-4 text-center">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
      <ul>
        {cartItems.map((item) => {
          const type = item.product ? 'product' : 'service';
          const productOrService = item.product || item.service;
          return (
            <li key={productOrService.id} className="flex items-center justify-between border-b py-2">
              <div>
                <h3 className="font-semibold">{productOrService.name}</h3>
                <p>${productOrService.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(productOrService.id, type, parseInt(e.target.value))}
                  className="w-16 border rounded px-2 py-1"
                />
                <button
                  onClick={() => handleRemove(productOrService.id, type)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex justify-between items-center">
        <div className="text-xl font-bold">Total: ${totalPrice.toFixed(2)}</div>
        <button
          onClick={handleCheckout}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
