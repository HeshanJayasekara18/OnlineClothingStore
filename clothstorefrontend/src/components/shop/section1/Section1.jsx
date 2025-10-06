import { useState, useMemo, useEffect } from 'react';
import img7 from '../../common/images/img7.jpg';

const API_URL = (process.env.REACT_APP_API_URL || "").trim();

export default function FashionStorePage() {
  const [selectedSort, setSelectedSort] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedFilters, setSelectedFilters] = useState({
    clothing: [],
    material: [],
    sleeveLength: [],
    neckline: [],
    occasion: [],
    season: [],
    color: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
        try {
          const response = await fetch(`${API_URL}/api/products`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const responseData = await response.json();
          // Handle wrapped response { success, count, data } or direct array
          const data = responseData.data || responseData;
          // Ensure data is an array
          setAllProducts(Array.isArray(data) ? data : []);
        } catch (err) {
          setError(err.message || "Failed to load products.");
          setAllProducts([]); // Set empty array on error
        } finally {
          setLoading(false);
        }
      };
    fetchProducts();
  }, []);




  // Extended products array with more items and filter attributes


  const handleFilterChange = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      clothing: [],
      material: [],
      sleeveLength: [],
      neckline: [],
      occasion: [],
      season: [],
      color: ''
    });
    setPriceRange([0, 200]);
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    // Ensure allProducts is an array before filtering
    if (!Array.isArray(allProducts)) {
      return [];
    }
    
    let filtered = allProducts.filter(product => {
      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
      // Category filter
      if (selectedFilters.clothing.length > 0) {
        if (!selectedFilters.clothing.includes(product.category)) return false;
      }
      // Material filter
      if (selectedFilters.material.length > 0) {
        if (!selectedFilters.material.includes(product.material)) return false;
      }

      // Color filter
      if (selectedFilters.color && selectedFilters.color !== product.color) return false;

      return true;
    });

    // Sort products
    switch (selectedSort) {
      case 'pricelowtohigh':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'pricehightolow':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default: // featured
        break;
    }

    return filtered;
  }, [allProducts, selectedFilters, priceRange, selectedSort]);

  const handlePriceRangeChange = (type, value) => {
    if (type === 'min') {
      setPriceRange([Math.min(value, priceRange[1] - 1), priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], Math.max(value, priceRange[0] + 1)]);
    }
  };

  const FilterSection = () => (
    <>
      {/* Clear All Filters */}
      <div className="p-4 border-b border-[#dce0e5]">
        <button
          onClick={clearAllFilters}
          className="text-[#1773cf] text-sm font-medium hover:underline"
        >
          Clear all filters
        </button>
      </div>

      {/* Price Range */}
      <div className="p-4 border-b border-[#dce0e5]">
        <p className="text-[#111418] text-base font-medium leading-normal mb-4">Price Range</p>
        <div className="flex gap-2 mb-4">
          <div className="flex flex-col">
            <label className="text-xs text-[#637588] mb-1">Min</label>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => handlePriceRangeChange('min', parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 border border-[#dce0e5] rounded text-sm"
              min="0"
              max="200"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-[#637588] mb-1">Max</label>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => handlePriceRangeChange('max', parseInt(e.target.value) || 200)}
              className="w-20 px-2 py-1 border border-[#dce0e5] rounded text-sm"
              min="0"
              max="200"
            />
          </div>
        </div>
        <div className="text-sm text-[#637588]">
          ${priceRange[0]} - ${priceRange[1]}
        </div>
      </div>

      {/* Sort By */}
      <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Sort By</h3>
      <div className="flex flex-col gap-2 p-4 border-b border-[#dce0e5]">
        {[
          { label: 'Featured', value: 'featured' },
          { label: 'Price: Low to High', value: 'pricelowtohigh' },
          { label: 'Price: High to Low', value: 'pricehightolow' },
          { label: 'Newest', value: 'newest' }
        ].map((option) => (
          <label key={option.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="radio"
              className="h-4 w-4 text-[#1773cf]"
              name="sort"
              checked={selectedSort === option.value}
              onChange={() => setSelectedSort(option.value)}
            />
            <p className="text-[#111418] text-sm font-medium leading-normal">{option.label}</p>
          </label>
        ))}
      </div>

      {/* Type of Clothing */}
      <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Category</h3>
      <div className="px-4 border-b border-[#dce0e5] pb-4">
        {['Shirts', 'Pants', 'Dresses', 'Outerwear'].map(item => (
          <label key={item} className="flex gap-x-3 py-2 flex-row cursor-pointer hover:bg-gray-50 px-2 rounded">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#dce0e5] border-2 bg-transparent text-[#1773cf]"
              checked={selectedFilters.clothing.includes(item)}
              onChange={() => handleFilterChange('clothing', item)}
            />
            <p className="text-[#111418] text-sm font-normal leading-normal">{item}</p>
          </label>
        ))}
      </div>

      {/* Material */}
      <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Material</h3>
      <div className="px-4 border-b border-[#dce0e5] pb-4">
        {['Cotton', 'Wool', 'Silk', 'Denim'].map(item => (
          <label key={item} className="flex gap-x-3 py-2 flex-row cursor-pointer hover:bg-gray-50 px-2 rounded">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#dce0e5] border-2 bg-transparent text-[#1773cf]"
              checked={selectedFilters.material.includes(item)}
              onChange={() => handleFilterChange('material', item)}
            />
            <p className="text-[#111418] text-sm font-normal leading-normal">{item}</p>
          </label>
        ))}
      </div>

      {/* Color Selection */}
      <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Color</h3>
      <div className="flex flex-wrap gap-3 p-4">
        {[
          { name: 'white', color: 'rgb(255, 255, 255)', border: 'border-gray-300' },
          { name: 'black', color: 'rgb(0, 0, 0)', border: 'border-gray-300' },
          { name: 'red', color: 'rgb(239, 68, 68)', border: 'border-red-300' },
          { name: 'green', color: 'rgb(34, 197, 94)', border: 'border-green-300' },
          { name: 'blue', color: 'rgb(59, 130, 246)', border: 'border-blue-300' },
          { name: 'yellow', color: 'rgb(251, 191, 36)', border: 'border-yellow-300' }
        ].map(colorOption => (
          <label
            key={colorOption.name}
            className={`size-8 rounded-full border-2 cursor-pointer flex items-center justify-center hover:scale-110 transition-transform ${
              selectedFilters.color === colorOption.name ? 'ring-2 ring-[#1773cf] ring-offset-1' : colorOption.border
            }`}
            style={{ backgroundColor: colorOption.color }}
          >
            <input
              type="radio"
              className="invisible"
              name="color"
              value={colorOption.name}
              checked={selectedFilters.color === colorOption.name}
              onChange={() => setSelectedFilters(prev => ({ 
                ...prev, 
                color: prev.color === colorOption.name ? '' : colorOption.name 
              }))}
            />
            {selectedFilters.color === colorOption.name && (
              <div className="w-3 h-3 rounded-full border-2 border-white bg-transparent"></div>
            )}
          </label>
        ))}
      </div>
    </>
  );

  const ProductGrid = () => {
      if (loading) {
        return (
          <div className="col-span-full text-center py-12">
            <p className="text-[#637588] text-lg">Loading products...</p>
          </div>
        );
      }

      if (error) {
        return (
          <div className="col-span-full text-center py-12">
            <p className="text-red-500 text-lg">Error: {error}</p>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 p-4">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-[#637588] text-lg">No products found matching your filters</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-[#1773cf] text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredAndSortedProducts.map(product => (
              <div key={product.id} className="flex flex-col gap-3 group cursor-pointer">
                <div className="relative overflow-hidden">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    style={{ backgroundImage: `url("${product.imageUrl || img7}")` }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg"></div>
                </div>
                <div>
                  <p className="text-[#111418] text-sm md:text-base font-medium leading-normal line-clamp-2 group-hover:text-[#1773cf] transition-colors">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[#111418] text-base font-bold">${product.price}</p>
                  </div>
                  <p className="text-xs text-[#637588] mt-1">{product.material} • {product.category}</p>
                </div>
              </div>
            ))
          )}
        </div>
      );
    };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-white overflow-x-hidden font-sans">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:flex flex-col w-80 bg-white border-r border-[#dce0e5] h-screen sticky top-0">
            <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4 sticky top-0 bg-white border-b border-[#dce0e5]">Filters</h3>
            <FilterSection />
            
            {/* Advertisement Section */}
            <div className="mt-6 mx-4 mb-4 space-y-4">
              {/* Summer Sale Ad */}
              <div className="bg-gradient-to-br from-[#1773cf] to-[#0f5aa8] rounded-xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full translate-y-6 -translate-x-6"></div>
                <div className="relative z-10">
                  <h4 className="text-lg font-bold mb-2">Summer Sale!</h4>
                  <p className="text-sm text-blue-100 mb-3">Up to 50% off on selected items</p>
                  <button className="bg-white text-[#1773cf] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                    Shop Now
                  </button>
                </div>
              </div>

              {/* Image Advertisement */}
              <div className="relative rounded-xl overflow-hidden group cursor-pointer">
                <div 
                  className="w-full h-48 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url(${img7})` }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h5 className="text-white text-lg font-bold mb-1">New Collection</h5>
                    <p className="text-white text-sm opacity-90 mb-2">Discover the latest trends</p>
                    <button className="bg-white text-gray-900 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-100 transition-colors self-start">
                      Explore
                    </button>
                  </div>
                </div>
              </div>

              {/* Brand Spotlight */}
              <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] rounded-xl p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white bg-opacity-15 rounded-full -translate-y-6 translate-x-6"></div>
                <div className="relative z-10">
                  <h4 className="text-base font-bold mb-2">Brand Spotlight</h4>
                  <p className="text-sm text-orange-100 mb-3">Premium quality at amazing prices</p>
                  <div className="flex items-center gap-2">
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-medium">NIKE</span>
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-medium">ADIDAS</span>
                  </div>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gray-900 rounded-xl p-5 text-white">
                <div className="text-center">
                  <h4 className="text-base font-bold mb-2">Stay Updated</h4>
                  <p className="text-sm text-gray-300 mb-3">Get exclusive offers & new arrivals</p>
                  <div className="space-y-2">
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 rounded-lg bg-white text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="w-full bg-[#1773cf] hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Services Info */}
              <div className="bg-[#f8f9fa] rounded-lg p-4 border border-[#e9ecef]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#28a745] rounded-full flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22,4 12,14.01 9,11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#111418]">Free Shipping</h5>
                    <p className="text-xs text-[#637588]">On orders over $75</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ffc107] rounded-full flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="m12 1 3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6z"></path>
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#111418]">Quality Guarantee</h5>
                    <p className="text-xs text-[#637588]">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

          {/* Mobile Filter Overlay */}
          {isFilterOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)}></div>
              <div className="relative bg-white w-80 max-w-[85vw] h-full overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-[#dce0e5] sticky top-0 bg-white">
                  <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em]">Filters</h3>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <FilterSection />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex flex-col flex-1 w-full">
            {/* Mobile Filter Button */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#dce0e5] bg-white sticky top-0 z-10">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#dce0e5] rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                <span className="text-sm font-medium">Filters</span>
              </button>
              <div className="text-sm text-[#637588]">
                Showing {filteredAndSortedProducts.length} products
              </div>
            </div>

            
            {/* Breadcrumb */}
            <div className="flex flex-wrap gap-2 p-4">
              <a className="text-[#637588] text-sm md:text-base font-medium leading-normal hover:text-[#111418]" href="#">Home</a>
              <span className="text-[#637588] text-sm md:text-base font-medium leading-normal">/</span>
              <span className="text-[#111418] text-sm md:text-base font-medium leading-normal">Clothing</span>
            </div>

            {/* Page Title */}
            <h2 className="text-[#111418] tracking-light text-2xl md:text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">Clothing</h2>

            {/* Category Tags */}
            <div className="flex gap-3 p-3 flex-wrap pr-4">
              <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f0f2f4] pl-4 pr-4 hover:bg-[#e8ecef] cursor-pointer">
                <p className="text-[#111418] text-sm font-medium leading-normal">Men</p>
              </div>
              <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f0f2f4] pl-4 pr-4 hover:bg-[#e8ecef] cursor-pointer">
                <p className="text-[#111418] text-sm font-medium leading-normal">Women</p>
              </div>
              <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f0f2f4] pl-4 pr-4 hover:bg-[#e8ecef] cursor-pointer">
                <p className="text-[#111418] text-sm font-medium leading-normal">Kids</p>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedFilters.clothing.length > 0 || selectedFilters.material.length > 0 || selectedFilters.color) && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                <span className="text-sm text-[#637588]">Active filters:</span>
                {selectedFilters.clothing.map(filter => (
                  <span key={filter} className="inline-flex items-center gap-1 px-2 py-1 bg-[#1773cf] text-white text-xs rounded-full">
                    {filter}
                    <button 
                      onClick={() => handleFilterChange('clothing', filter)}
                      className="hover:bg-blue-700 rounded-full p-0.5"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                ))}
                {selectedFilters.material.map(filter => (
                  <span key={filter} className="inline-flex items-center gap-1 px-2 py-1 bg-[#1773cf] text-white text-xs rounded-full">
                    {filter}
                    <button 
                      onClick={() => handleFilterChange('material', filter)}
                      className="hover:bg-blue-700 rounded-full p-0.5"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                ))}
                {selectedFilters.color && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#1773cf] text-white text-xs rounded-full">
                    {selectedFilters.color}
                    <button 
                      onClick={() => setSelectedFilters(prev => ({ ...prev, color: '' }))}
                      className="hover:bg-blue-700 rounded-full p-0.5"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products */}
            <ProductGrid />

            {/* Pagination */}
            <div className="flex items-center justify-center p-4 gap-1">
              <a href="#" className="flex size-10 items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
                </svg>
              </a>
              <a className="text-sm font-bold leading-normal tracking-[0.015em] flex size-10 items-center justify-center text-[#111418] rounded-full bg-[#f0f2f4]" href="#">1</a>
              <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#111418] rounded-full hover:bg-gray-100 transition-colors" href="#">2</a>
              <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#111418] rounded-full hover:bg-gray-100 transition-colors" href="#">3</a>
              <a href="#" className="flex size-10 items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}