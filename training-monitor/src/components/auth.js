import axios from 'axios';

const REFRESH_THRESHOLD = 30 * 60 * 1000; // 12 hours in milliseconds
const SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      scheduleTokenRefresh(token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };
  
  export const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

const scheduleTokenRefresh = (token) => {
  const decodedToken = decodeToken(token);
  if (decodedToken && decodedToken.exp) {
    const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    
    // Schedule refresh 30 minutes before expiration or immediately if less than 30 minutes left
    const timeUntilRefresh = Math.max(timeUntilExpiration - REFRESH_THRESHOLD, 0);
    
    setTimeout(refreshToken, timeUntilRefresh);

    // Schedule logout after SESSION_DURATION
    setTimeout(logout, SESSION_DURATION);
  }
};

export const refreshToken = async () => {
  try {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      throw new Error('No token found');
    }

    const response = await axios.post('https://trainingapp-cn47.onrender.com/api/auth/refresh', { token: currentToken });
    const { token } = response.data;
    setAuthToken(token);
    scheduleTokenRefresh(token); // Schedule the next refresh
  } catch (error) {
    console.error('Failed to refresh token:', error);
    logout();
  }
};
  
  export const logout = () => {
    setAuthToken(null);
    window.location.reload(); // Reload the page to reset the app state
  };
  
  export const initializeAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
  };
  
  export const getDecodedToken = () => {
    const token = localStorage.getItem('token');
    return token ? decodeToken(token) : null;
  };