// ProductDashboard.js
import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Plus,
  Star,
  Grid,
  List,
  Edit,
  Trash,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    color: "",
    size: "",
    gender: "",
  });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();

  const API_URLL = (process.env.REACT_APP_API_URL || "").trim();
  const API_URL = `${API_URLL}/api/products`;

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter + Search
  const filteredProducts = products.filter((p) => {
    return (
      p.name?.toLowerCase().includes(search.toLowerCase()) &&
      (filters.category ? p.category === filters.category : true) &&
      (filters.color ? p.color === filters.color : true) &&
      (filters.size ? p.size === filters.size : true) &&
      (filters.gender ? p.gender === filters.gender : true)
    );
  });

  const handleAddProduct = () => {
    navigate("/admin-product-form");
  };

  const handleEditProduct = (id) => {
    navigate(`/admin-product-form?id=${id}`);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        alert("✅ Product deleted successfully");
      } else {
        const errorText = await res.text();
        alert(`❌ Failed to delete: ${errorText}`);
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("⚠️ Error deleting product");
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #2D3561 0%, #7AA5A3 50%, #B8D8D1 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <ShoppingBag size={32} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Fashion Store
            </h1>
          </div>
          <p className="text-white/80 text-lg">Discover your perfect style</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-10 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60"
                size={20}
              />
              <input
                type="text"
                placeholder="Search your favorite products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
              />
            </div>
            <div className="flex bg-white/20 rounded-2xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-white text-gray-800 shadow-lg"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-white text-gray-800 shadow-lg"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="px-4 py-3 rounded-2xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
            >
              <option value="">All Categories</option>
              <option value="Shirts">Shirts</option>
              <option value="Dresses">Dresses</option>
              <option value="Pants">Pants</option>
              <option value="Jackets">Jackets</option>
              <option value="Shoes">Shoes</option>
              <option value="Accessories">Accessories</option>
            </select>
            <select
              value={filters.color}
              onChange={(e) =>
                setFilters({ ...filters, color: e.target.value })
              }
              className="px-4 py-3 rounded-2xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
            >
              <option value="">All Colors</option>
              <option value="Red">Red</option>
              <option value="Black">Black</option>
              <option value="Blue">Blue</option>
              <option value="White">White</option>
              <option value="Green">Green</option>
            </select>
            <select
              value={filters.size}
              onChange={(e) => setFilters({ ...filters, size: e.target.value })}
              className="px-4 py-3 rounded-2xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
            >
              <option value="">All Sizes</option>
              <option value="XS">X-Small</option>
              <option value="S">Small</option>
              <option value="M">Medium</option>
              <option value="L">Large</option>
              <option value="XL">X-Large</option>
            </select>
            <select
              value={filters.gender}
              onChange={(e) =>
                setFilters({ ...filters, gender: e.target.value })
              }
              className="px-4 py-3 rounded-2xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unisex">Unisex</option>
            </select>

            <button
              onClick={handleAddProduct}
              className="col-span-2 md:col-span-1 px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-2xl font-semibold hover:from-green-500 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const mainImage = product.images?.[0] || product.imageUrl || "https://via.placeholder.com/300x300?text=No+Image";

                return (
                  <div
                    key={product.id}
                    className="group relative"
                    onMouseEnter={() => setHoveredCard(product.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="bg-white/15 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/25 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
                      {/* Main Image */}
                      <div className="relative mb-6 overflow-hidden rounded-2xl">
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                          }}
                        />

                        {/* Hover Edit/Delete */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${
                            hoveredCard === product.id
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        >
                          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                            <button
                              onClick={() => handleEditProduct(product.id)}
                              className="flex-1 bg-blue-500/80 text-white p-2 rounded-xl hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <Edit size={16} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-red-500/80 text-white p-2 rounded-xl hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <Trash size={16} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="text-white">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                          {product.name}
                        </h3>
                        <p className="text-white/70 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-green-300">
                            ${product.price}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star
                              size={16}
                              className="text-yellow-400 fill-current"
                            />
                            <span className="text-white/80 text-sm">
                              {product.rating || "4.5"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1 bg-white/20 rounded-full text-xs">
                            {product.size || "One Size"}
                          </span>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-xs">
                            {product.color}
                          </span>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-xs">
                            {product.gender}
                          </span>
                        </div>

                        <div className="text-xs text-white/60">{product.category}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20">
                  <ShoppingBag
                    size={64}
                    className="text-white/50 mx-auto mb-6"
                  />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    No Products Found
                  </h3>
                  <p className="text-white/70 mb-8">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={handleAddProduct}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mx-auto"
                  >
                    <Plus size={20} />
                    Add Your First Product
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const mainImage = product.images?.[0] || product.imageUrl || "https://via.placeholder.com/100x100?text=No+Image";

                return (
                  <div
                    key={product.id}
                    className="bg-white/15 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/25 transition-all duration-300"
                  >
                    <div className="flex items-center gap-6">
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-2xl"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/100x100?text=No+Image";
                        }}
                      />
                      <div className="flex-1 text-white">
                        <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                        <p className="text-white/70 text-sm mb-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-300 font-bold">
                            ${product.price}
                          </span>
                          <span>
                            {product.size || "One Size"} | {product.color} | {product.gender}
                          </span>
                          <span className="text-white/60">{product.category}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="p-2 bg-blue-500/80 text-white rounded-xl hover:bg-blue-600 transition-all duration-300"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 bg-red-500/80 text-white rounded-xl hover:bg-red-600 transition-all duration-300"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20">
                  <ShoppingBag
                    size={64}
                    className="text-white/50 mx-auto mb-6"
                  />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    No Products Found
                  </h3>
                  <p className="text-white/70">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDashboard;