import React, { useState, useEffect } from "react";
import img5 from "../../common/images/img5.jpg"
import img4 from "../../common/images/img4.jpg"
import img1 from "../../common/images/img3.jpg"
import img2 from "../../common/images/img2.jpg"
import img6 from "../../common/images/img6.jpg"


// Mock images for demo - replace with your actual images

const slides = [
  {
    id: 1,
    title: "MAGIC SLIDER",
    subtitle: "FASHION",
    description: "Discover the best fashion trends with our curated collection.",
    image: img1,
  },
  {
    id: 2,
    title: "NEW ARRIVALS",
    subtitle: "STYLISH",
    description: "Upgrade your wardrobe with the latest arrivals of the season.",
    image: img2,
  },
  {
    id: 3,
    title: "TRENDING NOW",
    subtitle: "ELEGANT",
    description: "Step into elegance with our trending designs loved by everyone.",
    image: img5,
  },
  {
    id: 4,
    title: "SPORTY VIBES",
    subtitle: "CASUAL",
    description: "Look sharp, stay comfortable with our sporty casual looks.",
    image: img6,
  },
];

export default function Section1() {
  const [current, setCurrent] = useState(0);

  // Auto play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative text-white overflow-hidden" style={{paddingTop: '80px', minHeight: '100vh'}}>
      {/* Background */}
      <div
        key={slides[current].id}
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${slides[current].image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6" style={{minHeight: '100vh', paddingTop: '0'}}>
        <h1 className="text-5xl lg:text-7xl font-bold mb-4 drop-shadow-lg animate-fade-in">
          {slides[current].title}
        </h1>
        <h2 className="text-3xl text-green-400 font-semibold mb-6 animate-slide-up">
          {slides[current].subtitle}
        </h2>
        <p className="max-w-2xl text-xl text-gray-200 mb-8 leading-relaxed animate-slide-up">
          {slides[current].description}
        </p>
        <button className="px-8 py-4 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-green-500 hover:text-white transition-all duration-300 transform hover:scale-105 animate-bounce-in">
          SEE MORE
        </button>
      </div>

      {/* Thumbnails */}
      <div className="absolute bottom-8 w-full flex justify-center gap-4 z-20">
        {slides.map((s, index) => (
          <img
            key={s.id}
            src={s.image}
            alt={s.title}
            onClick={() => setCurrent(index)}
            className={`w-20 h-28 object-cover rounded-lg shadow-lg cursor-pointer transition-all duration-500 ${
              index === current
                ? "ring-4 ring-green-500 scale-110 opacity-100"
                : "opacity-60 hover:opacity-100 hover:scale-105"
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="absolute top-1/2 left-6 transform -translate-y-1/2 z-20">
        <button
          onClick={prevSlide}
          className="w-14 h-14 flex items-center justify-center bg-green-500 bg-opacity-80 rounded-full shadow-lg hover:bg-green-600 hover:bg-opacity-100 transition-all duration-300 backdrop-blur-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="absolute top-1/2 right-6 transform -translate-y-1/2 z-20">
        <button
          onClick={nextSlide}
          className="w-14 h-14 flex items-center justify-center bg-green-500 bg-opacity-80 rounded-full shadow-lg hover:bg-green-600 hover:bg-opacity-100 transition-all duration-300 backdrop-blur-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-32 w-full flex justify-center gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === current 
                ? "bg-green-400 scale-125" 
                : "bg-white bg-opacity-50 hover:bg-opacity-75"
            }`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out 0.4s both;
        }
      `}</style>
    </div>
  );
}