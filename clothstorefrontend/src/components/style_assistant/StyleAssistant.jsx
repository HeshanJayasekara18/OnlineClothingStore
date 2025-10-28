import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Sparkles, Send } from "lucide-react";
import Navbar from "../common/navbar/Navbar";

const API_URL = (process.env.REACT_APP_API_URL || "https://clothstoreapiapp.azurewebsites.net").trim();

export default function StyleAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage = {
      role: "user",
      content: trimmed
    };

    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/stylist/chat`, {
        messages: conversation.map(({ role, content }) => ({ role, content }))
      });

      const assistantContent = res.data?.message ||
        "I'm having trouble reaching my styling tools right now. Could you try again in a moment?";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantContent
        }
      ]);
    } catch (err) {
      console.error(err);
      // FIX: Capture the exact error from the backend for better user feedback.
      const errorMessage = err.response?.data?.error || "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // NEW LOGIC: Check messages for the specific configuration error
  const isKeyError = messages.some(
    (m) => m.role === "assistant" && m.content.includes("Gemini API key not configured")
  );

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4 mt-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                AI Fashion Stylist
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Chat with our stylist and get outfit suggestions tailored to your plans.
            </p>
          </div>

          {/* NEW BANNER: Display a prominent warning if the API key error is found */}
          {isKeyError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert">
                <p className="font-bold">Configuration Error Detected</p>
                <p>The backend reported that the **Gemini API key is not configured**. This is a setup error in the server, not a conversation problem. Please ensure the `GeminiSettings:ApiKey` is correctly set.</p>
            </div>
          )}
          {/* END NEW BANNER */}

          <div className="bg-white rounded-2xl shadow-xl flex flex-col h-[70vh]">
            <div
              ref={chatBodyRef}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-purple-200"
            >
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-line ${
                      message.role === "assistant"
                        ? "bg-gradient-to-r from-purple-50 to-blue-50 text-gray-800 border border-purple-100"
                        : "bg-green-500 text-white"
                    } ${
                        // Optional: Highlight the error message bubble itself with red
                        message.role === "assistant" && message.content.includes("Gemini API key not configured") 
                            ? "!bg-red-500 !text-white !border-red-600" : ""
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {messages.length === 0 && !loading && (
                <div className="flex justify-center">
                  <div className="bg-white border border-dashed border-gray-200 text-gray-500 rounded-2xl px-4 py-3 text-center">
                    Start a chat by describing your occasion or style goals.
                  </div>
                </div>
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 text-gray-600 border border-purple-100 rounded-2xl px-4 py-3">
                    Typing...
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  placeholder="Describe the occasion, location, or style you're aiming for..."
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-3 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
