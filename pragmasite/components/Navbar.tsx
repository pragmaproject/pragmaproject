import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="text-xl font-bold text-apple-text tracking-tight hover:opacity-80 transition-opacity">
          Pragma
        </a>
        
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="text-sm font-medium text-gray-500 hover:text-apple-text transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium text-gray-500 hover:text-apple-text transition-colors">Pricing</a>
          <a href="#docs" className="text-sm font-medium text-gray-500 hover:text-apple-text transition-colors">Docs</a>
        </div>

        <button className="bg-apple-text text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-black transition-transform transform active:scale-95 shadow-md">
          Get API Key
        </button>
      </div>
    </nav>
  );
};

export default Navbar;