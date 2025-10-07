import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Edit, LogOut, ShoppingBag } from 'lucide-react';
import Navbar from '../common/navbar/Navbar';
import img4 from '../common/images/img4.png';

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("loggedUser");
    
    if (!storedUser) {
      // Redirect to login if not logged in
      navigate('/auth');
      return;
    }

    const userData = JSON.parse(storedUser);
    
    // Handle both Google and regular users
    // Google users have: FirstName, LastName (capitalized from backend)
    // Regular users might have: firstName, lastName (lowercase)
    const firstName = userData.FirstName || userData.firstName || userData.name?.split(' ')[0] || '';
    const lastName = userData.LastName || userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '';

    setUser(userData);
    setFormData({
      firstName: firstName,
      lastName: lastName,
      email: userData.Email || userData.email || '',
      phone: userData.Phone || userData.phone || ''
    });
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    // Update user in localStorage
    const updatedUser = {
      ...user,
      ...formData
    };
    localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    localStorage.removeItem("googleUser");
    navigate('/auth');
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
            <div 
              className="h-48 bg-cover bg-center relative"
              style={{ 
                backgroundImage: `url(${img4})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30"></div>
            </div>
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
                <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center mb-4 md:mb-0 relative z-10">
                  <User className="w-16 h-16 text-blue-600" />
                </div>
                <div className="md:ml-6 text-center md:text-left flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {formData.firstName} {formData.lastName}
                  </h1>
                  <p className="text-gray-600">{formData.email}</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Personal Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-gray-800 text-lg">{formData.firstName || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-gray-800 text-lg">{formData.lastName || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-gray-800 text-lg">{formData.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  ) : (
                    <p className="text-gray-800 text-lg">{formData.phone || 'Not set'}</p>
                  )}
                </div>

                {user.createdAt && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Member Since
                    </label>
                    <p className="text-gray-800 text-lg">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/shop')}
                    className="w-full flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-colors text-left"
                  >
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Browse Store</p>
                      <p className="text-sm text-gray-600">Discover new arrivals</p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/assitant')}
                    className="w-full flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-colors text-left"
                  >
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-800">AI Style Assistant</p>
                      <p className="text-sm text-gray-600">Get personalized recommendations</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-600">Logout</p>
                      <p className="text-sm text-red-500">Sign out of your account</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
