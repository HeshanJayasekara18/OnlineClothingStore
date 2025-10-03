import './App.css';


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from './components/Landing/Landing';
import Shop from './components/shop/Shop'
import Auth from './components/auth/AuthComponent/AuthComponent';
import StyleAssistant from './components/style_assistant/StyleAssistant';

import ProductForm from './components/AdminComponent/store/ProductForm';
import ProductDashboard from './components/AdminComponent/store/ProductDashboard';
import GoogleCallbackHandler from './components/auth/AuthComponent/GoogleCallbackHandler';


function App() {
  return (
    <BrowserRouter>
    
      <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/assitant" element={<StyleAssistant />} />
          <Route path="/auth/success" element={<GoogleCallbackHandler />} />

          <Route path="/admin-product-form" element={<ProductForm />} />
          <Route path="/admin-product-dashboard" element={<ProductDashboard />} />
      </Routes>
    </BrowserRouter>
      
      
   
  );
}

export default App;
