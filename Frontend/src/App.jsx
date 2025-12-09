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

// --- IMPORT THE NEW THEMEsdsdsdsd CONTEXT ---
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
import Contact from "./pages/Contact";
import MyVotes from './pages/MyVotes';  
import ForgotOtp from "./pages/ForgotOtp";
import VerifyOtp from "./pages/VerifyOtp";
import AdminUserReview from "./pages/AdminUserReview";
import AdminSupport from "./pages/AdminSupport";

// --- NAVBAR COMPONENT ---
const Navbar = () => {
  // Now using the shared theme logic!
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Help', path: '/help', icon: <HelpCircle size={18} /> },
    {name: 'Contact', path: '/contact', icon: <HelpCircle size={18} />},
    { name: 'Profile', path: '/profile', icon: <UserCircle size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
   <nav className="sticky top-0 z-50 w-full transition-colors duration-300 bg-white shadow-md dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-zinc-800">
      
      {/* 1. Top Govt Strip */}
      <div className="bg-[#0B2447] dark:bg-black text-white text-[10px] md:text-xs font-semibold py-1.5 px-4 border-b border-yellow-500">
          <div className="max-w-[1400px] mx-auto flex justify-between items-center">
              <span>GOVERNMENT OF INDIA</span>
              <span>MINISTRY OF ELECTRONICS & IT</span>
          </div>
      </div>

      {/* 2. Main Header Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        
        {/* Left: Emblem & Title */}
        <Link to="/" className="flex items-center gap-4 group">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="National Emblem" 
            className="object-contain w-auto h-12 transition-transform opacity-90 dark:invert dark:opacity-90 group-hover:scale-105"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-xl md:text-2xl font-bold text-[#0B2447] dark:text-white leading-tight">
              E Voting <span className="text-[#FF9933] dark:text-yellow-400">Portal</span>
            </h1>
            <p className="text-[10px] md:text-xs font-bold text-[#FF9933] tracking-wide uppercase">
              National E-Voting Platform
            </p>
          </div>
        </Link>

        {/* Center: Desktop Navigation */}
        <div className="items-center hidden h-full space-x-1 lg:flex">
            {navLinks.map((link) => (
                <Link
                key={link.name}
                to={link.path}
                className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full transition-all duration-200
                    ${isActive(link.path)
                    ? 'bg-[#0B2447] text-white dark:bg-yellow-400 dark:text-black shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#0B2447] dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-white'
                    }`}
                >
                <span className="mr-2">{link.icon}</span>
                {link.name}
                </Link>
            ))}
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-4">
           
           {/* Theme Toggle */}
           <button 
             onClick={toggleTheme}
             className="p-2 text-gray-600 transition-colors bg-gray-100 border border-gray-200 rounded-full dark:bg-zinc-800 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-zinc-700 dark:border-zinc-700"
             title="Toggle Theme"
           >
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
           </button>

           {/* Digital India Logo (Hidden on small screens) */}
           <div className="hidden md:block h-8 w-[1px] bg-gray-300 dark:bg-zinc-700"></div>
           <img 
              src="https://upload.wikimedia.org/wikipedia/en/9/95/Digital_India_logo.svg" 
              alt="Digital India" 
              className="hidden w-auto h-10 opacity-80 md:block dark:bg-white dark:p-1 dark:rounded"
           />

           {/* Logout Button (Desktop) */}
           <button 
              onClick={handleLogout}
              className="items-center hidden gap-2 px-4 py-2 ml-2 text-sm font-bold text-white transition-colors bg-red-600 rounded-lg shadow-sm md:flex hover:bg-red-700"
           >
              <LogOut size={16} />
              Logout
           </button>

           {/* Mobile Menu Toggle */}
           <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
           </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="bg-white border-b border-gray-200 md:hidden dark:bg-[#111] dark:border-zinc-800">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors
                  ${isActive(link.path)
                    ? 'bg-blue-50 text-[#0B2447] border border-blue-100 dark:bg-zinc-800 dark:text-yellow-400 dark:border-zinc-700'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800'
                  }`}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-zinc-800">
               <button 
                 onClick={handleLogout}
                 className="flex items-center w-full px-4 py-3 text-base font-medium text-left text-white bg-red-600 rounded-lg hover:bg-red-700"
               >
                 <LogOut size={18} className="mr-3"/>
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
  const hideNav = ["/login", "/register", "/forgot-password", "/verify-otp", "/contact"].includes(location.pathname);
  
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
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/support" element={<AdminSupport />} />
   
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}