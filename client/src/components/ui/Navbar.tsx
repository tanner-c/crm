import { Link } from "react-router";
import LogoutButton from "./LogoutButton";
import { isLoggedIn } from "../../lib/storage";
import { useEffect, useState } from "react";

export function Navbar() {
  const [loggedIn, setLoggedIn] = useState<boolean>(isLoggedIn());

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

  return (
    <nav className="w-full h-16 bg-gray-800 flex items-center px-4">
      <h1 className="text-white text-lg font-semibold">My CRM</h1>

      <div className="ml-auto">
        {loggedIn &&
          <>
            <Link to="/dashboard" className="text-gray-300 hover:text-white mx-2">
              Dashboard
            </Link>
            <Link to="/accounts" className="text-gray-300 hover:text-white mx-2">
              Accounts
            </Link>
            <Link to="/deals" className="text-gray-300 hover:text-white mx-2">
              Deals
            </Link>
            <LogoutButton />
          </>}
      </div>
    </nav>
  );

}
