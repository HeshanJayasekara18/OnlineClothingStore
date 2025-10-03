import { useState } from "react";
import axios from "axios";

const API_URL = (process.env.REACT_APP_API_URL || "").trim();

export default function StylistForm() {
  const [form, setForm] = useState({
    occasion: "",
    size: "",
    favoriteColor: "",
    gender: "",
    budget: ""
  });

  const [suggestion, setSuggestion] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStoreProducts([]);
    try {
      const res = await axios.post(`${API_URL}/api/stylist/suggest`, form);
      setSuggestion(res.data);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Check API logs.");
    } finally {
      setLoading(false);
    }
  };

  const showStoreProducts = async () => {
    if (!suggestion?.filter) return;
    setLoading(true);
    try {
      const { category, color } = suggestion.filter;
      const res = await axios.get(`${API_URL}/api/stylist/store`, {
        params: { category, color }
      });
      setStoreProducts(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch products from store.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">AI Fashion Stylist</h2>
      
      <form onSubmit={handleSubmit} className="grid gap-3">
        {["occasion","size","favoriteColor","gender","budget"].map(field => (
          <input
            key={field}
            type="text"
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={form[field]}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        ))}

        <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {loading ? "Suggesting..." : "Get Suggestions"}
        </button>
      </form>

      {suggestion && (
        <div className="mt-6 p-4 border rounded shadow">
          <p className="text-lg">{suggestion.suggestion}</p>
          <button
            className="mt-3 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            onClick={showStoreProducts}
          >
            Show from Store
          </button>
        </div>
      )}

      {storeProducts.length > 0 && (
        <div className="mt-6 space-y-4">
          {storeProducts.map(p => (
            <div key={p.id} className="p-4 border rounded shadow">
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p>{p.description}</p>
              <p><b>Price:</b> ${p.price}</p>
              <p><b>Color:</b> {p.color}</p>
              <img src={p.imageUrl} alt={p.name} className="mt-2 w-32 h-32 object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
