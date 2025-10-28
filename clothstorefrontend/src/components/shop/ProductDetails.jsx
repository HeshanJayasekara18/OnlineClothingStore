import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../common/navbar/Navbar";
import { Loader2, CheckCircle2, ShoppingCart, ArrowRight } from "lucide-react";
import placeholderImage from "../common/images/img7.jpg";

const API_URL = (process.env.REACT_APP_API_URL || "https://clothstoreapiapp.azurewebsites.net").trim();
const STORAGE_KEY = "clothstore_cart";

const normalizeCartItem = (product, quantity = 1) => {
  if (!product) {
    return null;
  }
  const identifier = product.id || product._id;
  if (!identifier) {
    return null;
  }
  const quantityValue = Number(quantity) > 0 ? Math.floor(Number(quantity)) : 1;
  return {
    id: identifier,
    productId: identifier,
    name: product.name || "",
    price: Number(product.price) || 0,
    imageUrl: product.imageUrl || "",
    size: product.size || "",
    color: product.color || "",
    category: product.category || "",
    sku: product.sku || "",
    quantity: quantityValue
  };
};

const loadCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`${API_URL}/api/products/${id}`, {
          signal: controller.signal
        });
        const data = response.data?.data || response.data;
        if (!data) {
          throw new Error("Product not found");
        }
        setProduct(data);
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }
        setError(err.response?.data?.error || err.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
    return () => controller.abort();
  }, [id]);

  const galleryImages = useMemo(() => {
    if (!product) {
      return [placeholderImage];
    }
    const images = [];
    if (product.imageUrl) {
      images.push(product.imageUrl);
    }
    if (Array.isArray(product.imageUrls)) {
      product.imageUrls.forEach((url) => {
        if (url && url !== product.imageUrl) {
          images.push(url);
        }
      });
    }
    if (!images.length) {
      images.push(placeholderImage);
    }
    return images;
  }, [product]);

  const handleQuantityChange = (nextValue) => {
    if (!Number.isFinite(Number(nextValue)) || Number(nextValue) < 1) {
      return;
    }
    setQuantity(Math.floor(Number(nextValue)));
  };

  const handleAddToCart = () => {
    const normalized = normalizeCartItem(product, quantity);
    if (!normalized) {
      return;
    }
    const current = loadCart();
    const existingIndex = current.findIndex(
      (item) => item.productId === normalized.productId || item.id === normalized.productId
    );
    if (existingIndex >= 0) {
      current[existingIndex] = {
        ...current[existingIndex],
        quantity: current[existingIndex].quantity + normalized.quantity,
        name: normalized.name || current[existingIndex].name,
        price: normalized.price || current[existingIndex].price,
        imageUrl: normalized.imageUrl || current[existingIndex].imageUrl,
        size: normalized.size || current[existingIndex].size,
        color: normalized.color || current[existingIndex].color,
        category: normalized.category || current[existingIndex].category,
        sku: normalized.sku || current[existingIndex].sku
      };
    } else {
      current.push(normalized);
    }
    saveCart(current);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-600 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading product details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">Product unavailable</p>
            <p className="mt-2 text-sm text-slate-500">{error || "We couldn't find the product you're looking for."}</p>
            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Back to shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stockLabel = product.stockQuantity > 10
    ? "In stock"
    : product.stockQuantity > 0
      ? `Only ${product.stockQuantity} left`
      : "Out of stock";

  const stockTone = product.stockQuantity > 10
    ? "text-emerald-600"
    : product.stockQuantity > 0
      ? "text-amber-600"
      : "text-rose-600";

  return (
    <div>
      <Navbar />
      <div className="bg-slate-50 py-16 px-4 mt-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row">
          <div className="flex-1 space-y-4">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <img
                src={galleryImages[0]}
                alt={product.name}
                className="w-full rounded-2xl object-cover"
              />
            </div>
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {galleryImages.slice(1, 4).map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    className="h-28 w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-400">{product.brand || product.category}</p>
                  <h1 className="mt-1 text-3xl font-semibold text-slate-900">{product.name}</h1>
                </div>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
                  {stockLabel}
                </span>
              </div>
              <div className="mt-4 text-4xl font-semibold text-slate-900">${Number(product.price || 0).toFixed(2)}</div>
              <p className="mt-6 text-sm leading-relaxed text-slate-600">{product.description || "No description available."}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-500">
                {product.size && (
                  <div>
                    <dt className="font-semibold text-slate-700">Size</dt>
                    <dd>{product.size}</dd>
                  </div>
                )}
                {product.color && (
                  <div>
                    <dt className="font-semibold text-slate-700">Color</dt>
                    <dd className="capitalize">{product.color}</dd>
                  </div>
                )}
                {product.category && (
                  <div>
                    <dt className="font-semibold text-slate-700">Category</dt>
                    <dd>{product.category}</dd>
                  </div>
                )}
                {product.brand && (
                  <div>
                    <dt className="font-semibold text-slate-700">Brand</dt>
                    <dd>{product.brand}</dd>
                  </div>
                )}
                {product.sku && (
                  <div>
                    <dt className="font-semibold text-slate-700">SKU</dt>
                    <dd>{product.sku}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-semibold text-slate-700">Availability</dt>
                  <dd className={stockTone}>{stockLabel}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-sm font-medium text-slate-700" htmlFor="quantity">
                  Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => handleQuantityChange(event.target.value)}
                  className="h-12 w-28 rounded-full border border-slate-200 bg-white text-center text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to cart
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                >
                  <ArrowRight className="h-4 w-4" />
                  Buy now
                </button>
              </div>
              {justAdded && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Added to cart. <button onClick={() => navigate("/cart")} className="underline">View cart</button>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Why shoppers love this pick</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>• Carefully curated fabric that stays breathable through the day.</li>
                <li>• Designed to mix and match with our latest seasonal palette.</li>
                <li>• Ships in recyclable packaging with easy returns within 30 days.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
