import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Navbar from "../common/navbar/Navbar";
import { ShoppingCart, Trash2, Loader2, Minus, Plus } from "lucide-react";

const API_URL = (process.env.REACT_APP_API_URL || "https://clothstoreapiapp.azurewebsites.net").trim();
const STORAGE_KEY = "clothstore_cart";
const COUPONS = {
  SAVE10: 0.1,
  FREESHIP: 0.05,
  NEW15: 0.15
};

export default function Cartpage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponFeedback, setCouponFeedback] = useState({ type: "", message: "" });
  const [addProductId, setAddProductId] = useState("");
  const [addQuantity, setAddQuantity] = useState(1);
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const processedIdsRef = useRef(new Set());

  const normalizeItem = (item, index = 0) => {
    const identifier = item?.id || item?.productId || item?._id || item?.sku || null;
    const quantityValue = Number(item?.quantity);
    const priceValue = Number(item?.price);
    return {
      id: identifier || `local-${index}`,
      productId: item?.productId || item?.id || item?._id || null,
      name: item?.name || "",
      price: Number.isFinite(priceValue) && priceValue >= 0 ? priceValue : 0,
      imageUrl: item?.imageUrl || item?.image || "",
      size: item?.size || item?.selectedSize || "",
      color: item?.color || item?.selectedColor || "",
      category: item?.category || "",
      sku: item?.sku || "",
      quantity: Number.isFinite(quantityValue) && quantityValue > 0 ? Math.floor(quantityValue) : 1
    };
  };

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(stored)) {
        setCartItems(stored.map((item, index) => normalizeItem(item, index)));
      }
    } catch {
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    const serializable = cartItems.map((item, index) => ({
      id: item.id || `local-${index}`,
      productId: item.productId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      size: item.size,
      color: item.color,
      category: item.category,
      sku: item.sku,
      quantity: item.quantity
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }, [cartItems]);

  useEffect(() => {
    const missing = cartItems.filter(item => item.productId && (!item.name || item.price === 0) && !processedIdsRef.current.has(item.productId));
    if (!missing.length) {
      return;
    }
    let active = true;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const updates = await Promise.all(
          missing.map(async item => {
            processedIdsRef.current.add(item.productId);
            const response = await axios.get(`${API_URL}/api/products/${item.productId}`);
            const data = response.data?.data || response.data;
            return {
              productId: item.productId,
              name: data?.name || item.name,
              price: Number(data?.price) || item.price,
              imageUrl: data?.imageUrl || item.imageUrl,
              size: item.size || data?.size || "",
              color: item.color || data?.color || "",
              category: data?.category || item.category,
              sku: data?.sku || item.sku
            };
          })
        );
        if (!active) {
          return;
        }
        setCartItems(prev =>
          prev.map(item => {
            if (!item.productId) {
              return item;
            }
            const update = updates.find(entry => entry.productId === item.productId);
            if (!update) {
              return item;
            }
            return {
              ...item,
              name: update.name,
              price: update.price,
              imageUrl: update.imageUrl,
              size: update.size,
              color: update.color,
              category: update.category,
              sku: update.sku
            };
          })
        );
        setError("");
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err.response?.data?.error || "Unable to load product details.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchDetails();
    return () => {
      active = false;
    };
  }, [cartItems]);

  useEffect(() => {
    if (!cartItems.length) {
      setAppliedCoupon(null);
      setCouponFeedback({ type: "", message: "" });
    }
  }, [cartItems]);

  const matchesIdentifier = (item, identifier) => item.id === identifier || item.productId === identifier;

  const handleQuantityChange = (identifier, delta) => {
    setCartItems(prev =>
      prev.map(item => {
        if (!matchesIdentifier(item, identifier)) {
          return item;
        }
        const nextQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: nextQuantity };
      })
    );
  };

  const handleQuantityInput = (identifier, value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 1) {
      return;
    }
    setCartItems(prev =>
      prev.map(item => (matchesIdentifier(item, identifier) ? { ...item, quantity: Math.floor(numeric) } : item))
    );
  };

  const handleRemoveItem = identifier => {
    setCartItems(prev => prev.filter(item => !matchesIdentifier(item, identifier)));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponFeedback({ type: "", message: "" });
  };

  const handleApplyCoupon = event => {
    event.preventDefault();
    const trimmed = couponInput.trim().toUpperCase();
    if (!trimmed) {
      setCouponFeedback({ type: "error", message: "Enter a coupon code." });
      return;
    }
    const rate = COUPONS[trimmed];
    if (!rate) {
      setCouponFeedback({ type: "error", message: "Coupon not recognized." });
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon({ code: trimmed, rate });
    setCouponFeedback({ type: "success", message: `Coupon ${trimmed} applied.` });
  };

  const handleAddToCart = async event => {
    event.preventDefault();
    const trimmedId = addProductId.trim();
    if (!trimmedId) {
      setAddError("Enter a product ID.");
      return;
    }
    if (!Number.isFinite(Number(addQuantity)) || Number(addQuantity) < 1) {
      setAddError("Quantity must be at least 1.");
      return;
    }
    try {
      setAdding(true);
      setAddError("");
      const response = await axios.get(`${API_URL}/api/products/${trimmedId}`);
      const data = response.data?.data || response.data;
      if (!data) {
        setAddError("Product not found.");
        return;
      }
      const identifier = data?.id || data?._id || trimmedId;
      setCartItems(prev => {
        const existing = prev.find(item => matchesIdentifier(item, identifier));
        if (existing) {
          return prev.map(item =>
            matchesIdentifier(item, identifier)
              ? {
                  ...item,
                  quantity: item.quantity + Math.floor(Number(addQuantity)),
                  name: data?.name || item.name,
                  price: Number(data?.price) || item.price,
                  imageUrl: data?.imageUrl || item.imageUrl,
                  size: item.size || data?.size || "",
                  color: item.color || data?.color || "",
                  category: data?.category || item.category,
                  sku: data?.sku || item.sku
                }
              : item
          );
        }
        const nextItem = normalizeItem(
          {
            id: identifier,
            productId: identifier,
            name: data?.name,
            price: data?.price,
            imageUrl: data?.imageUrl,
            size: data?.size,
            color: data?.color,
            category: data?.category,
            sku: data?.sku,
            quantity: Math.floor(Number(addQuantity))
          },
          prev.length
        );
        return [...prev, nextItem];
      });
      setError("");
      setAppliedCoupon(null);
      setCouponInput("");
      setCouponFeedback({ type: "", message: "" });
      setAddProductId("");
      setAddQuantity(1);
    } catch (err) {
      setAddError(err.response?.data?.error || "Unable to add product.");
    } finally {
      setAdding(false);
    }
  };

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
    const discountRate = appliedCoupon?.rate || 0;
    const discount = subtotal * discountRate;
    const shipping = subtotal === 0 || subtotal >= 200 ? 0 : 9.99;
    const total = Math.max(0, subtotal - discount + shipping);
    return {
      subtotal,
      discount,
      shipping,
      total
    };
  }, [cartItems, appliedCoupon]);

  const formatCurrency = value => `$${value.toFixed(2)}`;

  const emptyState = !cartItems.length;

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-slate-50 py-16 px-4 mt-10">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Your Cart</h1>
                <p className="text-sm text-slate-500">Review items, adjust quantities, and proceed when ready.</p>
              </div>
            </div>
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {loading && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating product details
              </div>
            )}
            {emptyState ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12">
                <ShoppingCart className="w-12 h-12 text-slate-300" />
                <div className="text-center">
                  <p className="text-lg font-medium text-slate-800">Your cart is waiting to be styled.</p>
                  <p className="text-sm text-slate-500">Browse the shop and add pieces you love.</p>
                </div>
                <a
                  href="/shop"
                  className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                >
                  Browse collections
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{cartItems.length} {cartItems.length === 1 ? "item" : "items"}</span>
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="text-rose-500 transition hover:text-rose-600"
                  >
                    Clear cart
                  </button>
                </div>
                <div className="space-y-5">
                  {cartItems.map((item, index) => {
                    const identifier = item.id || item.productId || `item-${index}`;
                    return (
                      <div
                        key={identifier}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center"
                      >
                        <div className="h-32 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name || "Product"} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">No image</div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h2 className="text-lg font-semibold text-slate-900">{item.name || "Product"}</h2>
                              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                {item.category && <span className="rounded-full bg-white px-2 py-1 border border-slate-200">{item.category}</span>}
                                {item.size && <span className="rounded-full bg-white px-2 py-1 border border-slate-200">Size {item.size}</span>}
                                {item.color && <span className="rounded-full bg-white px-2 py-1 border border-slate-200 capitalize">{item.color}</span>}
                                {item.sku && <span className="rounded-full bg-white px-2 py-1 border border-slate-200">SKU {item.sku}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-slate-900">{formatCurrency((Number(item.price) || 0) * item.quantity)}</p>
                              <p className="text-xs text-slate-500">{formatCurrency(Number(item.price) || 0)} each</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(identifier, -1)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={event => handleQuantityInput(identifier, event.target.value)}
                                className="h-10 w-16 rounded-full border border-slate-200 bg-white text-center text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                              />
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(identifier, 1)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(identifier)}
                              className="flex items-center gap-2 text-sm font-medium text-rose-500 transition hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">Quick add by ID</h2>
              <form onSubmit={handleAddToCart} className="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
                <input
                  type="text"
                  value={addProductId}
                  onChange={event => setAddProductId(event.target.value)}
                  placeholder="Product ID"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                <input
                  type="number"
                  min="1"
                  value={addQuantity}
                  onChange={event => setAddQuantity(Number(event.target.value) || 1)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                <button
                  type="submit"
                  disabled={adding}
                  className="flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </button>
              </form>
              {addError && <p className="text-sm text-rose-500">{addError}</p>}
            </div>
            <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-semibold text-slate-900">Order Summary</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span className="font-medium text-emerald-600">-{formatCurrency(totals.discount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-slate-900">{totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
              <form onSubmit={handleApplyCoupon} className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={event => setCouponInput(event.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                  <button
                    type="submit"
                    className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Apply
                  </button>
                </div>
                {couponFeedback.message && (
                  <p className={`text-sm ${couponFeedback.type === "success" ? "text-emerald-600" : "text-rose-500"}`}>
                    {couponFeedback.message}
                  </p>
                )}
              </form>
              <button
                type="button"
                disabled={emptyState}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Proceed to checkout
              </button>
              <div className="space-y-2 text-xs text-slate-500">
                {appliedCoupon?.code && <p>Coupon {appliedCoupon.code} is active.</p>}
                <p>Orders over $200 ship free automatically.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
