import axios from 'axios';

const REFRESH_THRESHOLD = 12 * 60 * 60 * 1000; // 6 hours in milliseconds

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
    setTimeout(refreshToken, REFRESH_THRESHOLD);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const refreshToken = async () => {
  try {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      throw new Error('No token found');
    }

    const response = await axios.post('/api/auth/refresh', { token: currentToken });
    const { token } = response.data;
    setAuthToken(token);
  } catch (error) {
    console.error('Failed to refresh token:', error);
    // Handle the error (e.g., redirect to login page)
  }
};

export const logout = () => {
  setAuthToken(null);
  // Additional logout logic (e.g., redirect to login page)
};

// Call this function when your app initializes
export const initializeAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
  }
};