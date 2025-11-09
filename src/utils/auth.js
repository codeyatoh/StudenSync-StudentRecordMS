// Authentication utilities

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

// Get current token
export const getToken = () => {
  return localStorage.getItem('authToken');
};

// Clear authentication data
export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

