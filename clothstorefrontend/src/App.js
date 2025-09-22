import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from './components/landing/Landing';
import Shop from './components/shop/Shop'
import ShopingCart from './components/shopping-cart/ShoppingCart'
import ScrollToTop from './ScrollToTop';
import Auth from './components/auth/AuthComponent/AuthComponent';

function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<ShopingCart />} />
          <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
      
      
   
  );
}

export default App;
