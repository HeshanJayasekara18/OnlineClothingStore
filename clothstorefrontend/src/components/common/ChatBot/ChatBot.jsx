import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import chatIcon from '../images/chaticon.png';

export default function ChatBot() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    navigate('/assitant');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#228d0f] to-[#1773cf] rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-10 animate-bounce-slow"
          title="Chat with AI Stylist"
        >
          
          
          {/* Chat Icon Image */}
          <img 
            src={chatIcon} 
            alt="Chat Icon" 
            className="relative w-20 h-20 object-contain animate-wiggle" 
          />
          
          {/* Notification Badge */}
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-14 h-6 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            Verve AI
          </span>
        </button>

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-20 right-0 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
            Chat with Verve AI Stylist
            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-gray-900 transform rotate-45"></div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(10deg);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
