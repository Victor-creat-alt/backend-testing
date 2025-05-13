import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart(state, action) {
      const { product, service, quantity } = action.payload;
      const id = product ? product.id : service.id;
      const existingItem = state.cartItems.find(item => item.product?.id === id || item.service?.id === id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({
          id: id,
          product,
          service,
          quantity,
        });
      }
    },
    updateCartItemQuantity(state, action) {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find(item => item.id === id);
      if (item) {
        item.quantity = quantity;
      }
    },
    removeItemFromCart(state, action) {
      const id = action.payload;
      state.cartItems = state.cartItems.filter(item => item.id !== id);
    },
    clearCart(state) {
      state.cartItems = [];
    },
  },
});

export const { addItemToCart, updateCartItemQuantity, removeItemFromCart, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.cartItems;

export default cartSlice.reducer;
