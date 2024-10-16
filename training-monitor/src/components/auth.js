import axios from 'axios';
import jwtDecode from 'jwt-decode'; // You'll need to install this package

const REFRESH_THRESHOLD = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

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

const scheduleTokenRefresh = (token) => {
  const decodedToken = jwtDecode(token);
  const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const timeUntilRefresh = expirationTime - currentTime - REFRESH_THRESHOLD;

  setTimeout(refreshToken, Math.max(timeUntilRefresh, 0));
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