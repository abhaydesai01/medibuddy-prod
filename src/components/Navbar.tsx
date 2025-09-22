import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../store/store";
import Logo from "../assets/logo.png";
import { User, Menu, X, ChevronDown } from "lucide-react";

const Navbar: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/symptom-checker", label: "Symptom Checker" },
    { href: "/treatments", label: "Treatments" },
    { href: "/hospitals", label: "Hospitals" },
    { href: "/report-analysis", label: "Report Analysis" },
  ];

  // --- Logged-In User Navbar ---
  const renderLoggedInNav = () => (
    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button for Sidebar */}
        <div className="lg:hidden">
          <button onClick={onMenuClick} className="text-gray-600 p-2 -ml-2">
            <Menu size={24} />
          </button>
        </div>

        {/* CHANGE: Added MediiMate Logo for Desktop View */}
        <div className="hidden lg:flex">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src={Logo}
              alt="Mediimate company logo"
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-gray-800">MediiMate</span>
          </Link>
        </div>
      </div>

      {/* User Dropdown Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          className="flex items-center gap-2 text-gray-700 rounded-full p-1 pr-3 transition hover:bg-gray-100"
        >
          <User
            size={28}
            className="bg-gray-200 rounded-full p-1.5 text-gray-600"
          />
          <span className="font-medium text-sm hidden sm:block">
            {user?.name}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform text-gray-500 ${
              isUserDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );

  // --- Logged-Out Guest Navbar ---
  const renderGuestNav = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative flex h-20 items-center justify-between">
        <div className="flex-shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img src={Logo} alt="Mediimate company logo" className="h-8 w-8" />
            <span className="text-2xl font-medium text-white">MediiMate</span>
          </Link>
        </div>
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
          <div className="flex items-center gap-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-md font-normal tracking-wide text-white/90 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center">
          <div className="hidden md:flex items-center gap-x-4">
            <Link
              to="/login"
              className="text-sm font-medium border border-gray-100/50 px-4 py-2 rounded-lg text-white/90 transition-colors hover:text-white hover:bg-gray-100/10"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
            >
              Sign Up
            </Link>
          </div>
          <div className="md:hidden ml-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/50 backdrop-blur-md p-6 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-lg text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/20 pt-4">
            <div className="space-y-4">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full rounded-md border border-white/50 px-4 py-2 text-center font-semibold text-white transition hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center font-semibold text-white transition hover:bg-blue-500"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const navClass = isAuthenticated
    ? "fixed top-0 left-0 w-full z-30"
    : `fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isScrolled ? "bg-black/30 backdrop-blur-lg" : "bg-transparent"
      }`;

  return (
    <nav className={navClass}>
      {isAuthenticated ? renderLoggedInNav() : renderGuestNav()}
    </nav>
  );
};

export default Navbar;
