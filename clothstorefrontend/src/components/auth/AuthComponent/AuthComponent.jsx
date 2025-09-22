import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Home, Shirt } from 'lucide-react';
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
  const API_URL = (process.env.REACT_APP_API_URL || "").trim();
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedUser');
    if (storedUser) setLoggedUser(JSON.parse(storedUser));
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (isSignUp) {
      // Sign Up
      try {
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

        if (!res.ok) throw new Error("Failed to register");
        alert("Registered successfully! Please login now.");
        setIsSignUp(false);
        setFormData({
          email: formData.email,
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          phone: "",
        });
      } catch (err) {
        console.error(err);
        alert("Error registering user");
      }
    } else {
      // Login
      try {
        const response = await fetch(`${API_URL}/api/customers/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        if (!response.ok) {
          const msg = await response.text();
          throw new Error(msg || "Failed to login");
        }

        const user = await response.json();
        setLoggedUser(user);
        localStorage.setItem("loggedUser", JSON.stringify(user));
        if (onLogin) onLogin(user);
        navigate("/home");
      } catch (err) {
        console.error(err);
        alert(err.message || "Error logging in");
      }
    }
  };

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
      phone: '',
    });
  };

  if (loggedUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Hello, {loggedUser.firstName}!</h1>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{background: 'linear-gradient(135deg, #DDF6D2 0%, #C8E6C9 50%, #A5D6A7 100%)'}}>
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-10 bg-white/10 backdrop-blur-md border-r border-white/20">
        {/* Top Navigation */}
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

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">
                {isSignUp ? 'Join Our Fashion Community' : 'Welcome Back, Clothey'}
              </h1>
              <p className="text-gray-700">
                {isSignUp 
                  ? 'Discover your style, define your story' 
                  : 'Sign in to continue your fashion journey'}
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="bg-white/20 backdrop-blur-md p-1 rounded-xl mb-6 border border-white/30">
              <div className="flex">
                <button
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-300 ${!isSignUp ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-300 ${isSignUp ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {isSignUp && (
                <div className="space-y-4 animate-in slide-in-from-top duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {isSignUp && (
                <div className="relative animate-in slide-in-from-top duration-300">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </div>

            <div className="text-center mt-6 text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={toggleMode}
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Fashion Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-200 rounded-full"></div>
          <div className="absolute top-60 right-20 w-20 h-20 bg-teal-200 rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-24 h-24 bg-emerald-300 rounded-full"></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <img src={img8} alt="Fashion showcase" className="w-full h-full object-cover"/>
        </div>
      </div>
    </div>
  );
}
