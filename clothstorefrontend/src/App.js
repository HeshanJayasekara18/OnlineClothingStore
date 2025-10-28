import './App.css';


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from './components/Landing/Landing';
import Shop from './components/shop/Shop';
import Auth from './components/auth/AuthComponent/AuthComponent';
import StyleAssistant from './components/style_assistant/StyleAssistant';
import UserProfile from './components/UserProfile/UserProfile';
import ForgotPassword from './components/auth/ForgotPassword/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword/ResetPassword';

import ProductForm from './components/AdminComponent/store/ProductForm';
import ProductDashboard from './components/AdminComponent/store/ProductDashboard';
import GoogleCallbackHandler from './components/auth/AuthComponent/GoogleCallbackHandler';
import Cartpage from './components/cart/Cartpage';
import ProductDetails from './components/shop/ProductDetails';


function App() {
  return (
    <BrowserRouter>
    
      <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/assitant" element={<StyleAssistant />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<GoogleCallbackHandler />} />

          <Route path="/cart" element={<Cartpage />} />
          <Route path="/admin-product-form" element={<ProductForm />} />
          <Route path="/admin-product-dashboard" element={<ProductDashboard />} />
      </Routes>
    </BrowserRouter>
      
      
   
  );
}

export default App;
