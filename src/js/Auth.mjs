import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class Auth {
    constructor() {
        this.tokenKey = "so-auth-token";
    }

    // Save the token to localStorage
    setToken(token) {
        setLocalStorage(this.tokenKey, token);
    }

    // Get the token from localStorage
    getToken() {
        return getLocalStorage(this.tokenKey);
    }

    // Check if the user is logged in
    isLoggedIn() {
        const token = this.getToken();
        return !!token;
    }

    // Logout: remove the token
    logout() {
        localStorage.removeItem(this.tokenKey);
    }

    // Get the Authorization header for API requests
    getAuthHeader() {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
}