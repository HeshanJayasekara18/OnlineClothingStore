import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Star, ArrowRight } from 'lucide-react';
import Navbar from '../common/navbar/Navbar';


export default function ClothingStoreLanding() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=600&fit=crop',
      title: 'New Summer Collection',
      subtitle: 'Discover the latest trends'
    },
    {
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=600&fit=crop',
      title: 'Elegant Styles',
      subtitle: 'Timeless fashion for every occasion'
    },
    {
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=600&fit=crop',
      title: 'Urban Streetwear',
      subtitle: 'Express your unique style'
    },
    {
      image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=600&fit=crop',
      title: 'Premium Quality',
      subtitle: 'Crafted with care and precision'
    },
    {
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&h=600&fit=crop',
      title: 'Exclusive Deals',
      subtitle: 'Up to 50% off selected items'
    }
  ];

  const menCollection = [
    { image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400&h=500&fit=crop', name: 'Casual Shirts', price: '$49.99' },
    { image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop', name: 'Denim Jeans', price: '$79.99' },
    { image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop', name: 'Blazers', price: '$129.99' },
    { image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop', name: 'T-Shirts', price: '$29.99' }
  ];

  const womenCollection = [
    { image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop', name: 'Summer Dresses', price: '$89.99' },
    { image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop', name: 'Elegant Tops', price: '$59.99' },
    { image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=500&fit=crop', name: 'Skirts', price: '$69.99' },
    { image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&h=500&fit=crop', name: 'Blazers', price: '$119.99' }
  ];

  const kidsCollection = [
    { image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=500&fit=crop', name: 'Kids T-Shirts', price: '$24.99' },
    { image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&h=500&fit=crop', name: 'Casual Wear', price: '$34.99' },
    { image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=500&fit=crop', name: 'Denim Collection', price: '$39.99' },
    { image: 'https://images.unsplash.com/photo-1548238499-6c3c2f9d6e1a?w=400&h=500&fit=crop', name: 'Party Wear', price: '$49.99' }
  ];

  const latestDesigns = [
    { image: 'https://images.unsplash.com/photo-1558769132-cb1aea3c8908?w=500&h=600&fit=crop', name: 'Floral Maxi Dress', price: '$99.99', tag: 'NEW' },
    { image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=600&fit=crop', name: 'Oversized Hoodie', price: '$69.99', tag: 'TRENDING' },
    { image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop', name: 'Linen Suit', price: '$149.99', tag: 'HOT' },
    { image: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=500&h=600&fit=crop', name: 'Vintage Jacket', price: '$119.99', tag: 'NEW' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const ProductCard = ({ product }) => (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg mb-4 aspect-[4/5]">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <button className="bg-white text-gray-900 px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            Quick View
          </button>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
      <p className="text-purple-600 font-bold text-xl">{product.price}</p>
    </div>
  );

  const LatestProductCard = ({ product }) => (
    <div className="group cursor-pointer relative">
      <div className="relative overflow-hidden rounded-lg mb-4 aspect-[4/5]">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          {product.tag}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-lg font-bold mb-1">{product.name}</h3>
          <p className="text-xl font-bold">{product.price}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
          <Navbar/>

      {/* Hero Slider Section */}
      <div className="relative h-screen overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            
            <div className="relative h-full flex items-center justify-center text-center px-4">
              <div className="max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 mb-8">
                  {slide.subtitle}
                </p>
                <button className="bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl">
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
        >
          <ChevronRight size={32} />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Men's Collection */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Men's Collection</h2>
              <p className="text-gray-600">Sophisticated styles for modern gentlemen</p>
            </div>
            <button className="flex items-center gap-2 text-purple-600 font-semibold hover:gap-4 transition-all">
              View All <ArrowRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {menCollection.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Women's Collection */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Women's Collection</h2>
              <p className="text-gray-600">Elegant fashion for every woman</p>
            </div>
            <button className="flex items-center gap-2 text-purple-600 font-semibold hover:gap-4 transition-all">
              View All <ArrowRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {womenCollection.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Designs */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Latest Designs</h2>
            <p className="text-purple-200 text-xl">Fresh arrivals from top designers</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {latestDesigns.map((product, index) => (
              <LatestProductCard key={index} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Kids Collection */}
      <section className="py-20 px-4 bg-gradient-to-r from-yellow-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Kids Collection</h2>
              <p className="text-gray-600">Comfortable and playful styles for little ones</p>
            </div>
            <button className="flex items-center gap-2 text-purple-600 font-semibold hover:gap-4 transition-all">
              View All <ArrowRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {kidsCollection.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Why Choose Us
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="text-purple-600" size={40} />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Free Shipping</h3>
              <p className="text-gray-600">On orders over $50. Fast and reliable delivery to your doorstep.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="text-purple-600" size={40} />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Premium Quality</h3>
              <p className="text-gray-600">Carefully curated collection of high-quality fashion pieces.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="text-purple-600" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4">24/7 Support</h3>
              <p className="text-gray-600">Our team is always here to help you with any questions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join Our Fashion Community
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Subscribe to get exclusive offers and style tips delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-6 py-4 rounded-full text-gray-900 flex-1 outline-none"
            />
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}