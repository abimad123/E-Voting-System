// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 dark:bg-gov-800 dark:border-gov-700">
      <div className="max-w-6xl px-4 py-4 mx-auto text-sm text-gray-600 dark:text-gov-200">
        <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
          <div>© {new Date().getFullYear()} E-Voting System — Government Demo</div>
          <div className="flex gap-4">
            <a className="hover:underline" href="/help">Help</a>
            <a className="hover:underline" href="/privacy">Privacy</a>
            <a className="hover:underline" href="/terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
