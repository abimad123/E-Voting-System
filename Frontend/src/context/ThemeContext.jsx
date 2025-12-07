import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    // Save to localStorage whenever it changes
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Optional: Add class to body/html for global tailwind support if needed
    // document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {/* This wrapper applies the 'dark' class based on the shared state.
        Any component inside this provider will inherit the theme.
      */}
      <div className={isDarkMode ? "dark" : ""}>
        <div className="min-h-screen font-sans text-gray-900 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme in any component
export const useTheme = () => useContext(ThemeContext);