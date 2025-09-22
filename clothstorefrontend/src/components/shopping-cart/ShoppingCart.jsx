import React, { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import Navbar from '../common/navbar/Navbar';

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Classic Cotton T-Shirt',
      price: 25.00,
      quantity: 1,
      size: 'M',
      image: '/api/placeholder/80/80'
    },
    {
      id: 2,
      name: 'Slim Fit Jeans',
      price: 80.00,
      quantity: 2,
      size: '8',
      image: '/api/placeholder/80/80'
    },
    {
      id: 3,
      name: 'Leather Belt',
      price: 35.00,
      quantity: 1,
      size: 'One Size',
      image: '/api/placeholder/80/80'
    }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  return (
    <div>
        <Navbar/>
        <div className="max-w-4xl mx-auto p-4 bg-white min-h-screen">
          {/* Breadcrumb */}
          <div className="text-gray-500 text-sm mb-6 hidden sm:block">
            <span>Home</span> <span className="mx-2">/</span> <span>Shopping Cart</span>
          </div>
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900">Your Shopping Cart</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-full sm:w-20 h-48 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Image</span>
                      </div>
                    </div>
                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">Size: {item.size}</p>
                        </div>
        
                        {/* Remove button - mobile */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="sm:hidden self-end text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mt-4 gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-md w-fit">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 text-gray-600"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 text-gray-600"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        {/* Price and Remove button */}
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span className="font-semibold text-lg text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
        
                          {/* Remove button - desktop */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="hidden sm:block text-gray-400 hover:text-gray-600 p-1"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">Order Summary</h2>
        
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
        
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
        
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
        
                  <hr className="border-gray-300" />
        
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
        
                <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ShoppingCart;