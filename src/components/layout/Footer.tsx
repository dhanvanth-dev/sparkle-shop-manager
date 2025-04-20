
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="animate-fade-in">
            <h3 className="text-2xl font-serif mb-4">Saaral</h3>
            <p className="text-gray-300 mb-4">Timeless elegance, crafted for you. Our jewelry pieces tell unique stories through exceptional craftsmanship.</p>
          </div>
          
          <div className="animate-fade-in delay-150">
            <h4 className="text-lg font-medium mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-gold transition-colors">Home</Link></li>
              <li><Link to="/collections" className="text-gray-300 hover:text-gold transition-colors">Collections</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-gold transition-colors">About Us</Link></li>
            </ul>
          </div>
          
          <div className="animate-fade-in delay-300">
            <h4 className="text-lg font-medium mb-4">Contact</h4>
            <address className="not-italic text-gray-300">
              <p>123 Elegance Avenue</p>
              <p>Luxury District, LD 12345</p>
              <p className="mt-2">contact@saaraljewelry.com</p>
              <p>+1 (555) 123-4567</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Saaral Jewelry. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
