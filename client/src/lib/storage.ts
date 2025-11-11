export function getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

export function getToken() {
    return localStorage.getItem("token");
}   

export function isLoggedIn() { 
    return !!getToken();
}

export function clearStorage() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
}