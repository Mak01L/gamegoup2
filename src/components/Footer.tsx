import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#281e46]/[0.55] border-t border-purple-400/30 py-6 mt-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-purple-300 text-sm mb-4 md:mb-0">
          © 2024 GameGoUp. All rights reserved.
        </div>
        <div className="flex space-x-6 text-sm">
          <Link 
            to="/privacy" 
            className="text-purple-400 hover:text-purple-200 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link 
            to="/terms" 
            className="text-purple-400 hover:text-purple-200 transition-colors"
          >
            Terms of Service
          </Link>
          <a 
            href="mailto:contact@gamegoup.studio" 
            className="text-purple-400 hover:text-purple-200 transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;