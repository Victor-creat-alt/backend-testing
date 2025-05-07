import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Home from './Pages/Home/Home.jsx';
import Navbar from './Components/Navbar/Navbar.jsx';
import Products from './Pages/Products/ProductList.jsx';
import About from './Pages/About/About.jsx';
import Footer from './Components/Footer/Footer.jsx';
import LoginSignup from './Components/LoginSignup.jsx';
import SelectOption from './Components/SelectOption.jsx';
import LogOut from './Components/LogOut.jsx'; // Import LogOut
import ResetPassword from './Components/ResetPassword.jsx';
import VerificationSuccess from './Components/VerificationSuccess.jsx';
import VerifyEmail from './Components/VerifyEmail.jsx'; // Import VerifyEmail

// Administrator imports
import Admin from './Components/Administrator/Dashboard/Admin.jsx';
import Notifications from './Components/Administrator/Dashboard/Notifications.jsx';
import PurchaseHistory from './Components/Administrator/History/PurchaseHistory.jsx';
import ServiceHistory from './Components/Administrator/History/ServiceHistory.jsx';
import AddProducts from './Components/Administrator/Products/AddProducts.jsx';
import DeleteProducts from './Components/Administrator/Products/DeleteProducts.jsx';
import ProductOrders from './Components/Administrator/Products/ProductOrders.jsx';
import AddService from './Components/Administrator/Services/AddService.jsx';
import DeleteService from './Components/Administrator/Services/DeleteService.jsx';
import ServiceRequests from './Components/Administrator/Services/ServiceRequests.jsx';

// User imports
import Cart from './Components/User/Products/Cart.jsx';
import Checkout from './Components/User/Products/Checkout.jsx';
import Payment from './Components/User/Products/Payment.jsx';
import OrderServices from './Components/User/Services/OrderServices.jsx';
import ViewServices from './Components/User/Services/ViewServices.jsx';
import ServicesList from './Pages/Services/ServicesList.jsx';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <div className="app-container">
            <Routes>
              <Route path="/" element={<SelectOption/>} />
              <Route path="/login" element={<LoginSignup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verification-success" element={<VerificationSuccess />} />
              <Route path="/verify-email" element={<VerifyEmail />} /> {/* Added VerifyEmail route */}
              <Route path="/home" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/about" element={<About />} />
              <Route path="/logout" element={<LogOut />} /> {/* Add LogOut route */}
              <Route path="/services" element={<ServicesList />} /> {/* Added services route */}

              {/* Administrator routes */}
              <Route path="/admin-dashboard" element={<Admin />} />
              <Route path="/admin-notifications" element={<Notifications />} />
              <Route path="/admin-purchase-history" element={<PurchaseHistory />} />
              <Route path="/admin-service-history" element={<ServiceHistory />} />
              <Route path="/admin-add-products" element={<AddProducts />} />
              <Route path="/admin-delete-products" element={<DeleteProducts />} />
              <Route path="/admin-product-orders" element={<ProductOrders />} />
              <Route path="/admin-add-service" element={<AddService />} />
              <Route path="/admin-delete-service" element={<DeleteService />} />
              <Route path="/admin-service-requests" element={<ServiceRequests />} />

              {/* User routes */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/order-services" element={<OrderServices />} />
              <Route path="/view-services" element={<ViewServices />} />

              <Route path="*" element={<Navigate to="/" replace />} /> {/* Fallback route */}
            </Routes>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
