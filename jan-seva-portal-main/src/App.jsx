import React, { useState, useEffect, useContext, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { 
  Moon, 
  Sun, 
  LogOut, 
  LayoutDashboard, 
  HelpCircle, 
  UserCircle, 
  Menu, 
  X 
} from 'lucide-react';

// --- YOUR EXISTING PAGE IMPORTS ---
// (Make sure these files exist in your project)
// Note: I've commented out the original Navbar import since we are defining it below
// import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ElectionDetail from "./pages/ElectionDetail";
import ElectionResults from "./pages/ElectionResults";
import Profile from "./pages/Profile";
import Help from "./pages/HelpFAQ";
import AdminPanel from "./pages/AdminPanel";
import MyVotes from './pages/MyVotes';  
import ForgotOtp from "./pages/ForgotOtp";
import VerifyOtp from "./pages/VerifyOtp";

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {/* This div wraps the entire app. 
         If isDarkMode is true, it adds the "dark" class.
         Tailwind uses this class to apply 'dark:' styles to all children.
      */}
      <div className={isDarkMode ? "dark" : ""}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Custom hook for easy access
const useTheme = () => useContext(ThemeContext);

/**
 * ----------------------------------------------------------------------
 * NEW NAVBAR COMPONENT (Integrated Locally)
 * We define it here so it can easily access the ThemeContext
 * ----------------------------------------------------------------------
 */
const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Help', path: '/help', icon: <HelpCircle size={18} /> },
    { name: 'Profile', path: '/profile', icon: <UserCircle size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  // Simple Logout handler (adjust as needed for your auth logic)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b transition-colors duration-300 
      bg-white border-gray-200 
      dark:bg-gray-900 dark:border-gray-700 shadow-sm">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Section */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3">
             {/* You can replace this SVG with your own logo image */}
             <div className="w-8 h-8 flex items-center justify-center">
               <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-800 dark:text-gray-100 fill-current">
                 <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" fill="none" stroke="currentColor" strokeWidth="2"/>
               </svg>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
              <span className="font-bold text-xl text-blue-900 dark:text-blue-400 tracking-tight">Jan Seva</span>
              <span className="font-bold text-xl text-orange-500 dark:text-orange-400 tracking-tight">Portal</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 h-full">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors duration-200
                  ${isActive(link.path)
                    ? 'border-blue-900 text-gray-900 dark:border-blue-400 dark:text-white' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors focus:outline-none"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium transition-colors
              dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex items-center md:hidden">
             <button onClick={toggleTheme} className="p-2 mr-2 text-gray-500 dark:text-gray-400">
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium
                  ${isActive(link.path)
                    ? 'bg-blue-50 border-blue-900 text-blue-700 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300'
                    : 'border-transparent text-gray-500 dark:text-gray-400'
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
               <button 
                 onClick={handleLogout}
                 className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-800"
               >
                 Sign out
               </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

/**
 * ----------------------------------------------------------------------
 * AUTH & ROUTES UTILS
 * ----------------------------------------------------------------------
 */
function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user && user.role === "admin") return children;
  } catch (e) {
    // fallthrough
  }
  return children;
}

/**
 * ----------------------------------------------------------------------
 * LAYOUT WRAPPER
 * Updated to handle dark mode background colors
 * ----------------------------------------------------------------------
 */
function Layout({ children }) {
  const location = useLocation();
  const hideNav = ["/login", "/register", "/forgot-password", "/verify-otp"].includes(location.pathname);
  
  return (
    // Added: dark:bg-gray-900 dark:text-gray-100 for global page theme
    <div className="flex flex-col min-h-screen transition-colors duration-300 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {!hideNav && <Navbar />}
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}

/**
 * ----------------------------------------------------------------------
 * MAIN APP
 * ----------------------------------------------------------------------
 */
export default function App() {
  return (
    <ThemeProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/help" element={<Help />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/elections/:id"
              element={
                <ProtectedRoute>
                  <ElectionDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/elections/:id/results"
              element={
                <ProtectedRoute>
                  <ElectionResults />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-votes"
              element={
                <ProtectedRoute>
                  <MyVotes />
                </ProtectedRoute>
              }
            />
            

            {/* Admin panel */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
            <Route path="/forgot-password" element={<ForgotOtp />} />
<Route path="/verify-otp" element={<VerifyOtp />} />


            {/* Default */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}