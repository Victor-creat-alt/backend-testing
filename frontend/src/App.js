import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from './redux/store';
import { CartProvider } from './contexts/CartContext';

import Home from './Components/pages/Home/Home';
import Products from './Components/pages/Products/Products';
import ProductDetail from './Components/pages/Products/ProductDetail';
import About from './Components/pages/About/About';
import Login from './Components/pages/Login/Login';
import ResetPassword from './Components/pages/Login/ResetPassword';
import Service from './Components/pages/Services/Service';

import AdminLayout from './Components/Administrator/admin_layout/AdminLayout';
import AdminDashboard from './Components/Administrator/Dashboard/Admin_Dashboard';
import AdminProducts from './Components/Administrator/Products/AdminProducts';
import AdminServices from './Components/Administrator/Services/AdminServices';
import OrdersManagement from './Components/Administrator/Products/OrdersManagement';
import Appointments from './Components/Administrator/Services/Appointments';
import ServiceHistory from './Components/Administrator/History/ServiceHistory';
import PurchaseHistory from './Components/Administrator/History/PurchaseHistory';
import Notifications from './Components/Administrator/Dashboard/Notifications';
import ServiceRequestManagement from './components/admin/ServiceRequestManagement';

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
            return '/dashboard';
        }
        return '/home';
    };

    return (
        <Router>
            {token && <NavBar />}
            <Routes>
                <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
                <Route path="/login" element={token ? <Navigate to={getDefaultRoute()} replace /> : <Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/home" element={token ? <Home /> : <Navigate to="/login" replace />} />
                <Route path="/products" element={token ? <Products /> : <Navigate to="/login" replace />} />
                <Route path="/products/:id" element={token ? <ProductDetail /> : <Navigate to="/login" replace />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={token ? <Service /> : <Navigate to="/login" replace />} />
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
                    <Route path="notifications" element={<Notifications />} />
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
            <CartProvider>
                <AppContent />
            </CartProvider>
        </Provider>
    );
}

export default App;
