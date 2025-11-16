export function callAPIWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem("token");
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    if (import.meta.env.VITE_API_URL) {
        const protocol = import.meta.env.DEV ? 'http' : 'https';
        
        // Render environment variable only gives us the subdomain, not the full domain.
        const domain = import.meta.env.DEV ? '' : '.onrender.com';
        
        url = `${protocol}://${import.meta.env.VITE_API_URL}${domain}/api/${url}`;
    }

    return fetch(url, { ...options, headers });
}


export function callAPI(url: string, options: RequestInit = {}): Promise<Response> {
    if (import.meta.env.VITE_API_URL) {
        const protocol = import.meta.env.DEV ? 'http' : 'https';

        const domain = import.meta.env.DEV ? '' : '.onrender.com';

        url = `${protocol}://${import.meta.env.VITE_API_URL}${domain}/api/${url}`;
    }

    return fetch(url, { ...options });
}
