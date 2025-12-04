import { useNavigate } from "react-router";
import { clearStorage } from "../../lib/storage"

export default function LogoutButton() {
    // Since JWT is stateless, logout is handled client-side by clearing storage

    const navigate = useNavigate();

    const handleLogout = () => {
        clearStorage();
        window.dispatchEvent(new Event('auth'));
        navigate("/login");
    };

    return (
        <button className="w-24 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-105" onClick={handleLogout}>
            🚪 Logout
        </button>
    );
}