import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import errorReducer from './errorSlice';
import productReducer from './productSlice';
import servicesReducer from './servicesSlice';
import cartReducer from './cartSlice';
import serviceRequestReducer from './serviceRequestSlice';
import orderReducer from './orderSlice';

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    error: errorReducer,
    products: productReducer,
    services: servicesReducer,
    cart: cartReducer,
    serviceRequests: serviceRequestReducer,
    orders: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
