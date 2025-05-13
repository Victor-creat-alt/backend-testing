import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from './redux/store';

import Home from './Components/pages/Home/Home';
import Products from './Components/pages/Products/Products';
import ProductDetail from './Components/pages/Products/ProductDetail';
import About from './Components/pages/About/About';
import LoginPage from './Components/pages/Login/Login'; // Renamed import
import RegisterPage from './Components/pages/Login/RegisterPage'; // Added import
import ResetPassword from './Components/pages/Login/ResetPassword';
import Service from './Components/User/Services/Service';
import ServicesList from './Components/pages/Services/ServicesList';

import AdminLayout from './Components/Administrator/admin_layout/AdminLayout';
import AdminDashboard from './Components/Administrator/Dashboard/Admin_Dashboard';
import AdminProducts from './Components/Administrator/Products/AdminProducts';
import AdminServices from './Components/Administrator/Services/AdminServices';
import OrdersManagement from './Components/Administrator/Products/OrdersManagement';
import Appointments from './Components/Administrator/Services/Appointments';
import ServiceHistory from './Components/Administrator/History/ServiceHistory';
import PurchaseHistory from './Components/Administrator/History/PurchaseHistory';
// Notifications component removed
import ServiceRequestManagement from './Components/Administrator/Services/ServiceRequestManagement';

import Cart from './Components/pages/Cart';
import Checkout from './Components/pages/Checkout';
import Payment from './Components/pages/Payment';
import PaymentSuccess from './Components/pages/PaymentSuccess';

import NavBar from './layouts/Navbar';
import Footer from './layouts/Footer';

function AppContent() {
  const token = useSelector((state) => state.auth.token);
  const userType = useSelector((state) => state.auth.userType);

  const getDefaultRoute = () => {
    if (!token) {
      return '/login';
    }
    if (userType && userType.toLowerCase() === 'admin') {
      return '/admin/dashboard';
    }
    return '/home';
  };

  return (
    <Router>
      {token && <NavBar />}
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
        <Route path="/login" element={token ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to={getDefaultRoute()} replace /> : <RegisterPage />} /> {/* Added route */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={token ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/products" element={token ? <Products /> : <Navigate to="/login" replace />} />
        <Route path="/products/:id" element={token ? <ProductDetail /> : <Navigate to="/login" replace />} />
        <Route path="/services" element={token ? <Service /> : <Navigate to="/login" replace />} />
        <Route path="/services/:id" element={token ? <ServicesList /> : <Navigate to="/login" replace />} />
        <Route path="/about" element={token ? <About /> : <Navigate to="/login" replace />} />
        <Route path="/cart" element={token ? <Cart /> : <Navigate to="/login" replace />} />
        <Route path="/checkout" element={token ? <Checkout /> : <Navigate to="/login" replace />} />
        <Route path="/payment" element={token ? <Payment /> : <Navigate to="/login" replace />} />
        <Route path="/payment-success" element={token ? <PaymentSuccess /> : <Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={token && userType && userType.toLowerCase() === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/*"
          element={token && userType && userType.toLowerCase() === 'admin' ? <AdminLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="service-history" element={<ServiceHistory />} />
          <Route path="purchase-history" element={<PurchaseHistory />} />
          {/* Notifications route removed */}
          <Route path="service-requests" element={<ServiceRequestManagement />} />
        </Route>
      </Routes>
      <Footer />
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;