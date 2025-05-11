import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [], // { id, product or service, quantity }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.cartItems.find(
        (cartItem) =>
          (cartItem.product && item.product && cartItem.product.id === item.product.id) ||
          (cartItem.service && item.service && cartItem.service.id === item.service.id)
      );
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        state.cartItems.push(item);
      }
    },
    updateItemQuantity: (state, action) => {
      const { id, quantity, type } = action.payload; // type: 'product' or 'service'
      const existingItem = state.cartItems.find((cartItem) => {
        if (type === 'product' && cartItem.product) {
          return cartItem.product.id === id;
        }
        if (type === 'service' && cartItem.service) {
          return cartItem.service.id === id;
        }
        return false;
      });
      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },
    removeItemFromCart: (state, action) => {
      const { id, type } = action.payload;
      state.cartItems = state.cartItems.filter((cartItem) => {
        if (type === 'product' && cartItem.product) {
          return cartItem.product.id !== id;
        }
        if (type === 'service' && cartItem.service) {
          return cartItem.service.id !== id;
        }
        return true;
      });
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const { addItemToCart, updateItemQuantity, removeItemFromCart, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.cartItems;

export default cartSlice.reducer;
