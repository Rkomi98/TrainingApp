import axios from 'axios';

// Define the API base URL using the environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Keep your constants
const REFRESH_THRESHOLD = 30 * 60 * 1000; // 30 minutes in milliseconds
const SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

// Use a variable to keep track of timers to prevent duplicates
let refreshTimeoutId = null;
let sessionTimeoutId = null;

// Function to clear existing timers
const clearTimers = () => {
    if (refreshTimeoutId) {
        clearTimeout(refreshTimeoutId);
        refreshTimeoutId = null;
    }
    if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
        sessionTimeoutId = null;
    }
};

export const setAuthToken = (token) => {
    clearTimers(); // Clear any existing timers before setting new ones

    if (token) {
      // Set token for future axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Store token
      localStorage.setItem('token', token);
      // Schedule next refresh and eventual logout
      scheduleTokenRefresh(token);
    } else {
      // Clear token from axios and local storage
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  export const decodeToken = (token) => {
    try {
      // Basic JWT decoding (payload part)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      // If decoding fails, token is likely invalid or corrupted
      logout(); // Log out if token is bad
      return null;
    }
  };

const scheduleTokenRefresh = (token) => {
  const decodedToken = decodeToken(token);

  // Ensure token was decoded and has an expiration
  if (decodedToken && decodedToken.exp) {
    const expirationTime = decodedToken.exp * 1000; // Convert JWT exp (seconds) to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    console.log(`Token expires in: ${Math.round(timeUntilExpiration / 60000)} minutes`);


    // If token is already expired or very close, logout immediately
    if (timeUntilExpiration <= 0) {
        console.log("Token already expired. Logging out.");
        logout();
        return;
    }

    // Calculate time until refresh: 30 mins before expiry, but not less than 0
    const timeUntilRefresh = Math.max(timeUntilExpiration - REFRESH_THRESHOLD, 1000); // Wait at least 1 second

    console.log(`Scheduling token refresh in: ${Math.round(timeUntilRefresh / 60000)} minutes`);
    refreshTimeoutId = setTimeout(refreshToken, timeUntilRefresh);

    // Calculate time until session logout: Session duration from now, or token expiry, whichever is sooner
    const timeUntilLogout = Math.min(SESSION_DURATION, timeUntilExpiration);

    console.log(`Scheduling session logout in: ${Math.round(timeUntilLogout / 60000)} minutes`);
    sessionTimeoutId = setTimeout(() => {
        console.log("Session duration reached. Logging out.");
        logout();
    }, timeUntilLogout);

  } else {
      console.warn("Could not schedule token refresh: Invalid token or no expiration time.");
      // Optionally logout if the token is unusable
      // logout();
  }
};

export const refreshToken = async () => {
  try {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      // No token means user is likely already logged out or storage was cleared
      console.log("No token found, cannot refresh.");
      logout(); // Ensure logged out state
      return; // Stop execution
    }

    console.log("Attempting to refresh token...");
    // Use the API_BASE_URL variable to construct the full endpoint
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { token: currentToken });
    const { token: newToken } = response.data; // Expecting { token: '...' }

    if (!newToken) {
        throw new Error("Refresh successful, but no new token received.");
    }

    console.log("Token refreshed successfully.");
    setAuthToken(newToken); // This will store the new token and reschedule refresh/logout

  } catch (error) {
    console.error('Failed to refresh token:', error.response?.data || error.message);
    // If refresh fails (e.g., token revoked, server error), log the user out
    logout();
  }
};

  export const logout = () => {
    console.log("Logging out...");
    clearTimers(); // Stop any scheduled refresh/logout
    setAuthToken(null); // Clear token from axios and localStorage
    // Reloading is a simple way to reset all component state
    window.location.href = '/'; // Navigate to root, which App.js should render as Login/Register
    // Consider using React Router's navigate function if passed down or using context
    // window.location.reload(); // Alternative: Force reload
  };

  export const initializeAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log("Initializing auth with existing token.");
      setAuthToken(token); // This validates, sets headers, and schedules refresh/logout
    } else {
        console.log("No token found on initialization.");
    }
  };

  export const getDecodedToken = () => {
    const token = localStorage.getItem('token');
    // Attempt to decode only if token exists
    return token ? decodeToken(token) : null;
  };