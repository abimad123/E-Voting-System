// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
        <footer className="bg-[#1a1a1a] dark:bg-black text-gray-400 dark:text-zinc-500 py-6 text-center text-xs border-t-4 border-[#FF9933] mt-auto">
          <div className="flex justify-center gap-4 mb-2 text-gray-300 dark:text-gray-400">
             <span className="hover:text-white dark:hover:text-yellow-400 cursor-pointer">Website Policies</span>
             <span>|</span>
             <span className="hover:text-white dark:hover:text-yellow-400 cursor-pointer">Help & FAQ</span>
             <span>|</span>
             <span className="hover:text-white dark:hover:text-yellow-400 cursor-pointer">Feedback</span>
          </div>
          <p>© 2025 Jan Seva Portal. All rights reserved.</p>
          <p className="mt-1">Designed and Developed by National Informatics Centre (NIC)</p>
        </footer>
  );
}
