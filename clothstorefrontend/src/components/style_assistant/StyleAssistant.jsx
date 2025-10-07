import { useState } from "react";
import axios from "axios";
import { Sparkles, ShoppingBag } from "lucide-react";
import Navbar from "../common/navbar/Navbar";

const API_URL = (process.env.REACT_APP_API_URL || "https://clothstoreapiapp.azurewebsites.net").trim();

export default function StylistForm() {
  const [prompt, setPrompt] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert("Please describe your situation!");
      return;
    }

    setLoading(true);
    setSuggestion(null);
    setAvailableProducts([]);
    
    try {
      const res = await axios.post(`${API_URL}/api/stylist/suggest-with-products`, {
        prompt: prompt
      });
      setSuggestion(res.data.suggestion);
      setAvailableProducts(res.data.availableProducts || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    "I have a birthday party this weekend and I want to look elegant. My size is XL.",
    "I need casual wear for a coffee date. I prefer blue colors and my size is M.",
    "Looking for professional office wear, size L, budget around $100.",
    "I'm going to a beach vacation, need comfortable summer clothes, size S."
  ];

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 mt-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Fashion Stylist
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Describe your situation and get personalized style recommendations
            </p>
          </div>
          {/* Main Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tell us about your situation
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: I have a birthday party this weekend and I want to look elegant. My size is XL and I prefer dark colors..."
                  rows={5}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                />
              </div>
              {/* Example Prompts */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Try these examples:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {examplePrompts.map((example, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(example)}
                      className="text-left text-sm p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-gray-700"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Getting Suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Get Style Suggestions
                  </>
                )}
              </button>
            </form>
          </div>
          {/* AI Suggestion */}
          {suggestion && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-fade-in">
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Your Personalized Style Recommendation</h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {suggestion}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Available Products */}
          {availableProducts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-800">Available in Our Store</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-400 hover:shadow-lg transition-all"
                  >
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h4 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">Category:</span> {product.category}</p>
                      <p><span className="font-semibold">Color:</span> {product.color}</p>
                      <p><span className="font-semibold">Size:</span> {product.size}</p>
                      <p className="text-lg font-bold text-purple-600 mt-2">${product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
