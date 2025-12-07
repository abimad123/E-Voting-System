import React, { useState } from 'react';
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

// --- IMPORT THE NEW THEME CONTEXT ---
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// --- PAGE IMPORTS ---
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
import AdminUserReview from "./pages/AdminUserReview";

// --- NAVBAR COMPONENT ---
const Navbar = () => {
  // Now using the shared theme logic!
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Help', path: '/help', icon: <HelpCircle size={18} /> },
    { name: 'Profile', path: '/profile', icon: <UserCircle size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <nav className="sticky top-0 z-50 w-full transition-colors duration-300 bg-white border-b border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
           <div className="flex items-center gap-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
              alt="National Emblem" 
              className="object-contain w-auto h-12 opacity-90 dark:invert dark:opacity-90"
            />
            <div className="flex flex-col justify-center">
              <h1 className="text-xl md:text-2xl font-bold text-[#0B2447] dark:text-white leading-tight">
                E Voting <span className="text-[#FF9933] dark:text-yellow-400">Portal</span>
              </h1>
              <p className="text-[10px] md:text-xs font-bold text-[#FF9933] tracking-wide uppercase">
                Ministry of Electronics & IT, Government of India
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden h-full space-x-8 md:flex">
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
          <div className="items-center hidden space-x-4 md:flex">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 transition-colors border border-red-200 rounded-md hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center -mr-2 md:hidden">
             <button onClick={toggleTheme} className="p-2 mr-2 text-gray-500 dark:text-gray-400">
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="bg-white border-b border-gray-200 md:hidden dark:bg-gray-900 dark:border-gray-700">
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
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
               <button 
                 onClick={handleLogout}
                 className="block w-full px-4 py-2 text-base font-medium text-left text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-800"
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

// --- ROUTES UTILS ---
function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user && user.role === "admin") return children;
  } catch (e) { }
  return children;
}

function Layout({ children }) {
  const location = useLocation();
  const hideNav = ["/login", "/register", "/forgot-password", "/verify-otp"].includes(location.pathname);
  
  return (
    // NOTE: The ThemeProvider inside App now handles the outer "dark" class and background colors
    <div className="flex flex-col w-full min-h-screen">
      {!hideNav && <Navbar />}
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// --- MAIN APP ---
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/help" element={<Help />} />
            <Route path="/forgot-password" element={<ForgotOtp />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/elections/:id" element={<ProtectedRoute><ElectionDetail /></ProtectedRoute>} />
            <Route path="/elections/:id/results" element={<ProtectedRoute><ElectionResults /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/my-votes" element={<ProtectedRoute><MyVotes /></ProtectedRoute>} />

            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/admin/users/:id" element={<AdminRoute><AdminUserReview /></AdminRoute>} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}