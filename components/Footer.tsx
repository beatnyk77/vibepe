import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-sm font-bold">
          Vibepe Inc. © 2025
        </div>
        
        <div className="flex gap-8 text-sm text-gray-500">
          <a href="#" className="hover:text-black transition-colors">Terms</a>
          <a href="#" className="hover:text-black transition-colors">Privacy</a>
          <a href="#" className="hover:text-black transition-colors">Contact</a>
        </div>

        <div className="text-xs text-gray-400 max-w-xs text-center md:text-right">
          Banking services provided by partner banks. Vibepe is a technology provider, not a bank.
        </div>
      </div>
    </footer>
  );
};