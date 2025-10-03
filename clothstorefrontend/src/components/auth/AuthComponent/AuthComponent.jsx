import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Home, Shirt } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import img8 from '../../common/images/img8.jpg';
import { useNavigate } from 'react-router-dom';

export default function AuthComponent({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5218";
  const [loggedUser, setLoggedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Single useEffect for fetching current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/customers/current-user`, {
          credentials: "include",
        });
        
        if (res.ok) {
          const user = await res.json();
          setLoggedUser(user);
          localStorage.setItem("loggedUser", JSON.stringify(user));
          if (onLogin) onLogin(user);
        } else {
          // Check for stored user
          const storedUser = localStorage.getItem("loggedUser");
          if (storedUser) {
            const user = JSON.parse(storedUser);
            setLoggedUser(user);
            if (onLogin) onLogin(user);
          }
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
        // Check for stored user as fallback
        const storedUser = localStorage.getItem("loggedUser");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setLoggedUser(user);
          if (onLogin) onLogin(user);
        }
      }
    };
    
    fetchCurrentUser();
  }, [API_URL, onLogin]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (isSignUp) {
      // Registration
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match!");
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/customers/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to register");
        }

        alert("Registered successfully! Please login now.");
        setIsSignUp(false);
        setFormData({ 
          email: formData.email, 
          password: "", 
          confirmPassword: "", 
          firstName: "", 
          lastName: "", 
          phone: "" 
        });
      } catch (err) {
        console.error(err);
        alert(err.message || "Error registering user");
      } finally {
        setLoading(false);
      }
    } else {
      // Login
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/customers/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: formData.email, 
            password: formData.password 
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to login");
        }

        const user = await response.json();
        setLoggedUser(user);
        localStorage.setItem("loggedUser", JSON.stringify(user));
        if (onLogin) onLogin(user);
        navigate("/home");
      } catch (err) {
        console.error(err);
        alert(err.message || "Error logging in");
      } finally {
        setLoading(false);
      }
    }
  };

// ------------------ Google Login ------------------
const handleGoogleLogin = () => {
  // Use the correct endpoint
  window.location.href = `${API_URL}/api/auth/login-google`;
};

// Add this useEffect to handle Google callback when returning from OAuth
useEffect(() => {
  const checkForGoogleCallback = () => {
    // Check if we're on the success page with user data
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    
    if (userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        console.log("Google login success:", user);
        setLoggedUser(user);
        localStorage.setItem("loggedUser", JSON.stringify(user));
        if (onLogin) onLogin(user);
        
        // Redirect to home and clean URL
        navigate("/home", { replace: true });
      } catch (err) {
        console.error("Error parsing Google user data:", err);
        alert("Google login failed. Please try again.");
      }
    }
  };

  checkForGoogleCallback();
}, [navigate, onLogin]);




  const handleLogout = () => {
    localStorage.removeItem('loggedUser');
    setLoggedUser(null);
    alert("Logged out successfully");
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ 
      email: '', 
      password: '', 
      confirmPassword: '', 
      firstName: '', 
      lastName: '', 
      phone: '' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (loggedUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Hello, {loggedUser.firstName || loggedUser.name}!</h1>
        {loggedUser.picture && <img src={loggedUser.picture} alt="Profile" className="w-20 h-20 rounded-full mb-4" />}
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
        >
          Logout
        </button>
      </div>
    );
  }


  

    const handleGoogleLoginSuccess = (response) => {
    const profileObj = response.profileObj;

    const googleUser = {
      firstName: profileObj.givenName,
      lastName: profileObj.familyName,
      email: profileObj.email,
      name: profileObj.name
    };

    localStorage.setItem("googleUser", JSON.stringify(googleUser));
    navigate("/home"); // redirect after login
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #DDF6D2 0%, #C8E6C9 50%, #A5D6A7 100%)' }}>
      <div className="w-full lg:w-1/2 flex flex-col relative z-10 bg-white/10 backdrop-blur-md border-r border-white/20">
        <div className="p-6 flex justify-between items-center bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
              <Shirt className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Clothey
            </span>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200 rounded-lg hover:bg-gray-50"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-black mb-2">{isSignUp ? 'Join Our Fashion Community' : 'Welcome Back, Clothey'}</h1>
              <p className="text-gray-700">{isSignUp ? 'Discover your style, define your story' : 'Sign in to continue your fashion journey'}</p>
            </div>

            {/* Google Login Button */}
            <div className="mb-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all"
              >
                <FcGoogle className="w-5 h-5" />
                <span>{isSignUp ? 'Sign Up with Google' : 'Login with Google'}</span>
              </button>
            </div>

            <div className="text-center text-gray-400 my-2">or</div>

            {/* Regular Email/Password Form */}
            <div className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
                  </div>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>

              {isSignUp && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} className="w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              )}

              <button type="button" onClick={handleSubmit} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </div>

            <div className="text-center mt-4 text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={toggleMode} className="text-emerald-600 hover:text-emerald-700">{isSignUp ? 'Sign In' : 'Sign Up'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-200 rounded-full"></div>
          <div className="absolute top-60 right-20 w-20 h-20 bg-teal-200 rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-24 h-24 bg-emerald-300 rounded-full"></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <img src={img8} alt="Fashion showcase" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
