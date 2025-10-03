import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Flash Sale");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [firstName, setFirstName] = useState(null);

  const navItems = [
    { name: "Home", href: "/home" },
    { name: "New Arrivals", href: "/home" },
    { name: "Store", href: "/shop" },
    { name: "Women", href: "/home" },
    { name: "Men", href: "/home" },
    { name: "Assistant", href: "/assitant" },
  ];

  // Update user from localStorage
  useEffect(() => {
    const updateUser = () => {
      const storedMongoUser = localStorage.getItem("loggedUser");
      const storedGoogleUser = localStorage.getItem("googleUser");

      const user = storedMongoUser
        ? JSON.parse(storedMongoUser)
        : storedGoogleUser
        ? JSON.parse(storedGoogleUser)
        : null;

      if (user) setFirstName(user.firstName || user.name || "User");
      else setFirstName(null);
    };

    updateUser();
    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  const handleTabClick = (tabName, href) => {
    setActiveTab(tabName);
    setIsMobileMenuOpen(false);
    navigate(href);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleAuthClick = () => navigate("/auth");

  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    localStorage.removeItem("googleUser");
    setFirstName(null);
    navigate("/auth");
  };

  return (
    <header className="border-b border-solid border-b-[#f0f2f4]">
      {/* Desktop Navbar */}
      <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-[#111418]">
            <div className="size-4">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em]">
              Fashion Hub
            </h2>
          </div>
          <nav className="flex items-center gap-6 lg:gap-9">
            {navItems.map((item) => (
              <button
                key={item.name}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === item.name
                    ? "text-[#1773cf] font-semibold border-b-2 border-[#1773cf] pb-1"
                    : "text-[#111418] hover:text-[#1773cf]"
                }`}
                onClick={() => handleTabClick(item.name, item.href)}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {firstName ? (
            <>
              <span className="text-[#111418] text-sm font-medium">
                Hello, {firstName} 👋
              </span>
              <button
                onClick={handleLogout}
                className="text-[#1773cf] hover:text-[#0f5a99] text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleAuthClick}
              className="text-[#1773cf] hover:text-[#0f5a99] text-sm font-medium"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 text-[#111418]">
          <h2 className="text-[#111418] text-base font-bold leading-tight tracking-[-0.015em]">
            Fashion Hub
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {firstName ? (
            <span className="text-[#111418] text-xs font-medium hidden xs:block">
              Hi, {firstName} 👋
            </span>
          ) : (
            <button
              onClick={handleAuthClick}
              className="text-[#1773cf] text-xs font-medium hover:text-[#0f5a99] transition-colors hidden xs:block"
            >
              Login
            </button>
          )}

          <button
            onClick={toggleMobileMenu}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f2f4] hover:bg-[#e8eaed] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20px"
              height="20px"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d={
                  isMobileMenuOpen
                    ? "M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
                    : "M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Items */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#f0f2f4] px-4 py-2">
          <div className="border-b border-[#f0f2f4] pb-3 mb-3">
            {firstName ? (
              <div className="text-[#111418] text-sm font-medium py-2">
                Hello, {firstName} 👋
              </div>
            ) : (
              <button
                onClick={handleAuthClick}
                className="text-[#1773cf] text-sm font-medium hover:text-[#0f5a99] transition-colors py-2"
              >
                Login / Sign Up
              </button>
            )}
          </div>
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                className={`py-3 px-2 text-sm font-medium transition-colors rounded-lg ${
                  activeTab === item.name
                    ? "text-[#1773cf] font-semibold bg-[#f0f8ff]"
                    : "text-[#111418] hover:text-[#1773cf] hover:bg-[#f8f9fa]"
                }`}
                onClick={() => handleTabClick(item.name, item.href)}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
