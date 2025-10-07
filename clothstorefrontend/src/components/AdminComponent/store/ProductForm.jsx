import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ProductForm = () => {
  const [product, setProduct] = useState({
    id: null,
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    gender: "",
    size: "",
    category: "",
    material: "",
    color: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = (process.env.REACT_APP_API_URL || "").trim();

  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();
  const productId = query.get("id");

  // Fetch product for editing
  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [productId, API_URL]);

  // Handle input changes
  const handleChange = (e) => {
    let { name, value } = e.target;

    // Convert ImgBB viewer link to direct image URL
    if (
      name === "imageUrl" &&
      value.includes("ibb.co") &&
      !value.includes("i.ibb.co")
    ) {
      // Example: https://ibb.co/FLLYR7tc → https://i.ibb.co/FLLYR7tc.jpg
      const code = value.split("/").pop();
      value = `https://i.ibb.co/${code}.jpg`;
    }

    setProduct({
      ...product,
      [name]: name === "price" ? Number(value) : value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const method = productId ? "PUT" : "POST";
      const url = productId
        ? `${API_URL}/api/products/${productId}`
        : `${API_URL}/api/products`;

      // Remove id field for POST requests (MongoDB will auto-generate)
      const productData = { ...product };
      if (!productId) {
        delete productData.id;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const savedProduct = await response.json();
        setMessage(
          productId
            ? "✅ Product updated successfully!"
            : "✅ Product added successfully!"
        );

        // Reset form if adding new
        if (!productId) {
          setProduct({
            id: null,
            name: "",
            description: "",
            price: "",
            imageUrl: "",
            gender: "",
            size: "",
            category: "",
            material: "",
            color: "",
          });
        }

        // Notify dashboard to add product immediately
        window.dispatchEvent(
          new CustomEvent("productAdded", { detail: savedProduct })
        );
      } else {
        const errorText = await response.text();
        setMessage(`❌ Failed: ${errorText}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("⚠️ Error connecting to server.");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#F5F7F5" }}>
            Fashion Studio
          </h1>
          <p className="text-lg" style={{ color: "#A8C5C1" }}>
            {productId ? "Edit product details" : "Add new products"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex items-center mb-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                style={{ backgroundColor: "#7B9EA8" }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={productId ? "M12 4v16m8-8H4" : "M12 6v12m6-6H6"}
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold" style={{ color: "#2D3561" }}>
                {productId ? "Edit Product" : "Add New Product"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Price */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group">
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#2D3561" }}
                  >
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none transition-all duration-300"
                    style={{ borderColor: "#A8C5C1" }}
                  />
                </div>
                <div className="group">
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#2D3561" }}
                  >
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300"
                    style={{ borderColor: "#A8C5C1" }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="group">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2D3561" }}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 resize-none"
                  style={{ borderColor: "#A8C5C1" }}
                />
              </div>

              {/* Image URL */}
              <div className="group">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2D3561" }}
                >
                  Product Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={product.imageUrl}
                  onChange={handleChange}
                  placeholder="Paste ImgBB Viewer link or direct link"
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300"
                  style={{ borderColor: "#A8C5C1" }}
                />
              </div>

              {/* Gender, Size, Category */}
              <div className="grid md:grid-cols-3 gap-4">
                <select
                  name="gender"
                  value={product.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300"
                  style={{ borderColor: "#A8C5C1" }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unisex">Unisex</option>
                </select>
                <select
                  name="size"
                  value={product.size}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300"
                  style={{ borderColor: "#A8C5C1" }}
                >
                  <option value="">Select Size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
                <select
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300"
                  style={{ borderColor: "#A8C5C1" }}
                >
                  <option value="">Select Category</option>
                  <option value="Shirts">Shirts</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Pants">Pants</option>
                  <option value="Jackets">Jacket</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              {/* Material & Color A*/}
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="material"
                  value={product.material}
                  onChange={handleChange}
                  placeholder="Material"
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300"
                  style={{ borderColor: "#A8C5C1" }}
                />
                <input
                  type="text"
                  name="color"
                  value={product.color}
                  onChange={handleChange}
                  placeholder="Color"
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300"
                  style={{ borderColor: "#A8C5C1" }}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-8 rounded-xl text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #2D3561 0%, #7B9EA8 100%)",
                  }}
                >
                  {isLoading
                    ? productId
                      ? "Updating..."
                      : "Adding..."
                    : productId
                    ? "Update Product"
                    : "Add Product to Collection"}
                </button>
              </div>
            </form>

            {/* Message Display */}
            {message && (
              <div
                className={`mt-6 p-4 rounded-xl text-center font-semibold ${
                  message.includes("✅")
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-8">
          <p style={{ color: "#A8C5C1" }}>
            Building your fashion empire, one product at a time ✨
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
