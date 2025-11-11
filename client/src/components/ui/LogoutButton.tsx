import { useNavigate } from "react-router";
import { clearStorage } from "../../lib/storage"

export default function LogoutButton() {
    // Since JWT is stateless, logout is handled client-side by clearing storage

    const navigate = useNavigate();

    const handleLogout = () => {
        clearStorage();
        navigate("/");
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
}