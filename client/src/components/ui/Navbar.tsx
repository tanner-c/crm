import { Link } from "react-router";
import LogoutButton from "./LogoutButton";
import { isLoggedIn } from "../../lib/storage";
import { useEffect, useState } from "react";

export function Navbar() {
  const [loggedIn, setLoggedIn] = useState<boolean>(isLoggedIn());
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    // initialize state
    setLoggedIn(isLoggedIn());

    const handleAuthChange = () => setLoggedIn(isLoggedIn());

    // cross-tab localStorage changes
    window.addEventListener('storage', handleAuthChange);
    // in-app explicit auth events (dispatch new Event('auth') after login/logout)
    window.addEventListener('auth', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth', handleAuthChange as EventListener);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="fixed top-0 left-0 w-full h-16 gradient-bg flex items-center px-4 md:px-6 shadow-lg fade-in z-40">
      <h1 className="text-white text-lg md:text-xl font-bold">🚀 My CRM</h1>

      {/* Desktop Menu */}
      <div className="ml-auto hidden md:flex items-center space-x-4">
        {loggedIn &&
          <>
            <Link to="/dashboard" className="text-gray-200 hover:text-white transition-colors duration-200 px-2 py-1 rounded hover:bg-white/10">
              📊 Dashboard
            </Link>
            <Link to="/accounts" className="text-gray-200 hover:text-white transition-colors duration-200 px-2 py-1 rounded hover:bg-white/10">
              🏢 Accounts
            </Link>
            <Link to="/deals" className="text-gray-200 hover:text-white transition-colors duration-200 px-2 py-1 rounded hover:bg-white/10">
              💼 Deals
            </Link>
            <LogoutButton />
          </>}
      </div>

      {/* Mobile Hamburger Button */}
      {loggedIn && (
        <button
          onClick={toggleMenu}
          className="ml-auto md:hidden text-white text-2xl focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✖️' : '☰'}
        </button>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && loggedIn && (
        <div className="absolute top-16 left-0 w-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg md:hidden fade-in z-50">
          <div className="flex flex-col space-y-2 p-4">
            <Link
              to="/dashboard"
              className="text-gray-200 hover:text-white transition-colors duration-200 px-2 py-2 rounded hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              📊 Dashboard
            </Link>
            <Link
              to="/accounts"
              className="text-gray-200 hover:text-white transition-colors duration-200 px-2 py-2 rounded hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              🏢 Accounts
            </Link>
            <Link
              to="/deals"
              className="text-gray-200 hover:text-white transition-colors duration-200 px-2 py-2 rounded hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              💼 Deals
            </Link>
            <div className="pt-2">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );

}
