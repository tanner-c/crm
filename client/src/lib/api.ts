export function callAPIWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem("token");
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    if(import.meta.env.VITE_API_URL){
        url = `http://${import.meta.env.VITE_API_URL}/api/${url}`;
    }

    return fetch(url, { ...options, headers });
}


export function callAPI(url: string, options: RequestInit = {}): Promise<Response> {
    if (import.meta.env.VITE_API_URL) {
        url = `http://${import.meta.env.VITE_API_URL}/api/${url}`;
    }

    return fetch(url, { ...options });
}
