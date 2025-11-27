import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Home, Shirt } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import img8 from '../../common/images/img8.jpg';
import LoadingScreen from '../../common/LoadingScreen/LoadingScreen';

const API_URL = process.env.REACT_APP_API_URL || "";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

export default function AuthComponent({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '' });
  const [loggedUser, setLoggedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  const navigate = useNavigate();

  // -------------------- Persistent login --------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setLoggedUser(user);
        if (onLogin) onLogin(user);
      } catch (err) {
        console.error("Error parsing stored user:", err);
        localStorage.removeItem("loggedUser");
      }
    } else {
      fetchCurrentUser();
    }
  }, [onLogin]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/customers/current-user`, {
        credentials: "include",
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (res.ok) {
        const user = await res.json();
        setLoggedUser(user);
        localStorage.setItem("loggedUser", JSON.stringify(user));
        if (onLogin) onLogin(user);
      } else {
        console.log("No current user session");
      }
    } catch (err) {
      console.log("Failed to fetch current user - server might be down or no session");
    }
  };

  // -------------------- Handle form --------------------
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email?.toLowerCase?.().trim() ?? "",
          password: formData.password ?? ""
        })
      });

      const payload = await res.json();

      if (!res.ok) {
        const message = payload?.error || payload?.message || "Login failed";
        alert(message);
        return;
      }

      // payload may be { success:true, data: user } or plain user object
      const user = payload?.data ?? payload;

      // persist user and notify parent
      setLoggedUser(user);
      localStorage.setItem("loggedUser", JSON.stringify(user));
      if (typeof onLogin === "function") onLogin(user);

      // If admin -> navigate to admin dashboard, else to home
      const email = (user?.email || "").toLowerCase();
      const role = (user?.role || "").toLowerCase();

      if (role === "admin" || email === "heshan@admin.com") {
        navigate("/admin-product-dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Handle Google Token Login --------------------
  const handleGoogleToken = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      alert("Google login failed.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/verify-token`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Google login failed");
      }
      const user = await res.json();
      setLoggedUser(user);
      localStorage.setItem("loggedUser", JSON.stringify(user));
      if (onLogin) onLogin(user);
      
      // Show loading screen before navigation
      setShowLoadingScreen(true);
      setTimeout(() => {
        navigate("/home");
      }, 3000); // 3 second loading animation
    } catch (err) { 
      alert(err.message || "Google login failed"); 
    }
    finally { setLoading(false); }
  };

  // -------------------- Logout --------------------
  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    setLoggedUser(null);
    if (onLogin) onLogin(null);
    alert("Logged out successfully");
  };

  // -------------------- Redirect-based Google Login --------------------
  const handleGoogleRedirect = () => {
    window.location.href = `${API_URL}/api/auth/login-google`;
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '' });
  };

  // Show loading screen after successful login
  if (showLoadingScreen) {
    return <LoadingScreen />;
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>;
  
  if (loggedUser) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Hello, {loggedUser.firstName || loggedUser.name}!</h1>
      {loggedUser.picture && <img src={loggedUser.picture} alt="Profile" className="w-20 h-20 rounded-full mb-4" />}
      <button onClick={handleLogout} className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all">Logout</button>
    </div>
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #DDF6D2 0%, #C8E6C9 50%, #A5D6A7 100%)' }}>
        <div className="w-full lg:w-1/2 flex flex-col relative z-10 bg-white/10 backdrop-blur-md border-r border-white/20">
          {/* Header */}
          <div className="p-6 flex justify-between items-center bg-white/10 backdrop-blur-sm border-b border-white/20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                <Shirt className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Verve</span>
              
            </div>
            <button onClick={() => navigate("/home")} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200 rounded-lg hover:bg-gray-50">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-black mb-2">{isSignUp ? 'Join Our Fashion Community' : 'Welcome Back, Verve.'}</h1>
                <p className="text-gray-700">{isSignUp ? 'Discover your style, define your story' : 'Sign in to continue your fashion journey'}</p>
              </div>

              {/* Google Buttons */}
              <div className="mb-4 flex flex-col gap-2">
                <GoogleLogin
                  onSuccess={handleGoogleToken}
                  onError={() => alert("Google login failed")}
                  useOneTap
                  text={isSignUp ? "signup_with" : "signin_with"}
                  theme="outline"
                  size="large"
                />
                {/* <button 
                  onClick={handleGoogleRedirect} 
                  className="w-full flex items-center justify-center space-x-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <FcGoogle className="w-5 h-5" />
                  <span>{isSignUp ? 'Sign Up with Google (Redirect)' : 'Login with Google (Redirect)'}</span>
                </button> */}
              </div>

              <div className="text-center text-gray-400 my-2">or</div>

              {/* Email/Password Form */}
              <div className="space-y-4">
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      name="firstName" 
                      placeholder="First Name" 
                      value={formData.firstName} 
                      onChange={handleInputChange} 
                      className="w-full pl-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                      required 
                    />
                    <input 
                      type="text" 
                      name="lastName" 
                      placeholder="Last Name" 
                      value={formData.lastName} 
                      onChange={handleInputChange} 
                      className="w-full pl-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                      required 
                    />
                  </div>
                )}

                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email Address" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className="w-full pl-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                  required 
                />

                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    placeholder="Password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    className="w-full pl-4 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {isSignUp && (
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      name="confirmPassword" 
                      placeholder="Confirm Password" 
                      value={formData.confirmPassword} 
                      onChange={handleInputChange} 
                      className="w-full pl-4 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={handleLogin} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </button>
              </div>

              {/* Forgot Password Link */}
              {!isSignUp && (
                <div className="text-center mt-3">
                  <button 
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <div className="text-center mt-4 text-sm text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button onClick={toggleMode} className="text-emerald-600 hover:text-emerald-700">
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right-side image */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-200 rounded-full"></div>
            <div className="absolute top-60 right-20 w-20 h-20 bg-teal-200 rounded-full"></div>
            <div className="absolute bottom-20 left-32 w-24 h-24 bg-emerald-300 rounded-full"></div>
          </div>
          <img src={img8} alt="Fashion showcase" className="w-full h-full object-cover" />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
