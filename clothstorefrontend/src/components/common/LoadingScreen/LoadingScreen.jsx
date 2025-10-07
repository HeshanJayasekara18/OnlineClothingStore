import React, { useEffect, useState } from 'react';
import { Sparkles, ShoppingBag, Shirt, Heart } from 'lucide-react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);

  const loadingTexts = [
    "Preparing your fashion journey...",
    "Loading your style preferences...",
    "Setting up your wardrobe...",
    "Almost there..."
  ];

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Text rotation
    const textInterval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % loadingTexts.length);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center z-50">
      <div className="text-center px-4">
        {/* Animated Logo/Icons */}
        <div className="relative mb-8">
          {/* Center Circle */}
          <div className="w-32 h-32 mx-auto relative">
            {/* Rotating outer ring */}
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin" 
                 style={{ animationDuration: '3s' }}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>
            
            {/* Rotating middle ring */}
            <div className="absolute inset-2 border-4 border-purple-200 rounded-full animate-spin" 
                 style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full"></div>
            </div>

            {/* Center icon container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Animated icons */}
                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                  <ShoppingBag className="w-12 h-12 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Floating icons around */}
            <div className="absolute -top-4 -left-4 animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="absolute -top-4 -right-4 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
              <Heart className="w-6 h-6 text-green-500" />
            </div>
            <div className="absolute -bottom-4 -left-4 animate-bounce" style={{ animationDelay: '1s', animationDuration: '2s' }}>
              <Shirt className="w-6 h-6 text-green-500" />
            </div>
            <div className="absolute -bottom-4 -right-4 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2s' }}>
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-green-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
          Verve
        </h1>

        {/* Loading Text */}
        <p className="text-xl text-gray-700 mb-8 h-8 transition-opacity duration-500">
          {loadingTexts[currentText]}
        </p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-full bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress}%</p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
