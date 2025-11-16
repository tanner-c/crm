export function callAPIWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem("token");
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    if(import.meta.env.VITE_API_HOST && import.meta.env.VITE_API_PORT) {
        const protocol = import.meta.env.DEV ? 'http' : 'https';

        url = `${protocol}://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/${url}`;
    }

    return fetch(url, { ...options, headers });
}


export function callAPI(url: string, options: RequestInit = {}): Promise<Response> {
    if (import.meta.env.VITE_API_HOST && import.meta.env.VITE_API_PORT) {
        const protocol = import.meta.env.DEV ? 'http' : 'https';
        
        url = `${protocol}://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/${url}`;
    }

    return fetch(url, { ...options });
}
