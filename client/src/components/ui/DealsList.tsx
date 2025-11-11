import { useEffect } from "react";
import { fetchWithAuth } from "../../lib/api";
import { getCurrentUser } from "../../lib/storage";

export default function DealsList() {
    
    useEffect(() => {
        const user = getCurrentUser();
        const res = fetchWithAuth(`/api/deals/user/${user.id}`);
        
        console.log(res);
    }, []);

    return <div>Deals List Component</div>;
}