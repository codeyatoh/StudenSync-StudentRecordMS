// API Configuration and Services
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Always read from localStorage to get the latest token
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      // Update cached token
      this.token = token;
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Get response text first (can only read body once)
      let data;
      const contentType = response.headers.get('content-type');
      
      try {
        const text = await response.text();
        
        // Try to parse as JSON if content-type suggests JSON
        if (contentType && contentType.includes('application/json')) {
          try {
            data = text ? JSON.parse(text) : {};
          } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            console.error('Response text:', text);
            data = { message: `Server error (${response.status})` };
          }
        } else {
          // Not JSON, use text as message
          data = text ? { message: text } : { message: `HTTP error! status: ${response.status}` };
        }
      } catch (readError) {
        // Failed to read response body
        console.error('Failed to read response:', readError);
        data = { message: `HTTP error! status: ${response.status}` };
      }

      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        // Token is invalid or expired, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.setToken(null);
        
        // Only redirect and show error if not already on login page
        const isLoginPage = window.location.pathname === '/login';
        
        if (!isLoginPage) {
          window.location.href = '/login';
        }
        
        // Only throw error if not on login page (to prevent showing error on login form)
        if (!isLoginPage) {
        throw new Error('Session expired. Please login again.');
        } else {
          // On login page, just return a failure response instead of throwing
          return {
            success: false,
            message: data.message || data.error || 'Session expired'
          };
        }
      }

      // Handle 429 Too Many Requests
      if (response.status === 429) {
        const errorMessage = data.message || data.error || 'Too many requests. Please wait a moment and try again.';
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      // Only log non-401 errors to reduce console spam
      // 401 errors are expected when session expires
      if (error.message && !error.message.includes('Session expired')) {
      console.error('API Request Error:', error);
      }
      
      // If it's already our error, re-throw it
      if (error.message && (error.message.includes('HTTP error') || error.message.includes('Server error'))) {
        throw error;
      }
      
      // Don't wrap network errors - let them through
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
      
      // Otherwise, wrap it with a user-friendly message
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // FormData request (for file uploads)
  async requestFormData(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API FormData Request Error:', error);
      throw error;
    }
  }
}

// Create API service instance
const apiService = new ApiService();

// Authentication API
export const authAPI = {
  login: (credentials) => apiService.post('/auth/login', credentials),
  logout: () => apiService.post('/auth/logout'),
  getCurrentUser: () => apiService.get('/auth/me'),
};

// Students API
export const studentsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/students${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiService.get(`/students/${id}`),
  create: (data) => apiService.post('/students', data),
  createWithPhoto: (formData) => apiService.requestFormData('/students', {
    method: 'POST',
    body: formData,
  }),
  update: (id, data) => apiService.put(`/students/${id}`, data),
  updateWithPhoto: (id, formData) => apiService.requestFormData(`/students/${id}`, {
    method: 'PUT',
    body: formData,
  }),
  delete: (id) => apiService.delete(`/students/${id}`),
  // Archive/Restore functionality
  getArchived: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/students/archived${queryString ? `?${queryString}` : ''}`);
  },
  restore: (id) => apiService.put(`/students/${id}/restore`),
};

// Programs API
export const programsAPI = {
  getAll: () => apiService.get('/programs'),
  getById: (id) => apiService.get(`/programs/${id}`),
  create: (data) => apiService.post('/programs', data),
  update: (id, data) => apiService.put(`/programs/${id}`, data),
  delete: (id) => apiService.delete(`/programs/${id}`),
};

// Majors API
export const majorsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/majors${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiService.get(`/majors/${id}`),
  create: (data) => apiService.post('/majors', data),
  update: (id, data) => apiService.put(`/majors/${id}`, data),
  delete: (id) => apiService.delete(`/majors/${id}`),
};

// Courses API
export const coursesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/courses${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiService.get(`/courses/${id}`),
  create: (data) => apiService.post('/courses', data),
  update: (id, data) => apiService.put(`/courses/${id}`, data),
  delete: (id) => apiService.delete(`/courses/${id}`),
};

// Enrollments API
export const enrollmentsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/enrollments${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiService.get(`/enrollments/${id}`),
  create: (data) => apiService.post('/enrollments', data),
  update: (id, data) => apiService.put(`/enrollments/${id}`, data),
  delete: (id) => apiService.delete(`/enrollments/${id}`),
  // Archive/Restore functionality
  getArchived: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/enrollments/archived${queryString ? `?${queryString}` : ''}`);
  },
  restore: (id) => apiService.put(`/enrollments/${id}/restore`),
};

// Grades API
export const gradesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiService.get(`/grades${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiService.get(`/grades/${id}`),
  create: (data) => apiService.post('/grades', data),
  update: (id, data) => apiService.put(`/grades/${id}`, data),
  delete: (id) => apiService.delete(`/grades/${id}`),
};

// Users API
export const usersAPI = {
  getAll: () => apiService.get('/users'),
  getById: (id) => apiService.get(`/users/${id}`),
  create: (data) => apiService.post('/users', data),
  update: (id, data) => apiService.put(`/users/${id}`, data),
  delete: (id) => apiService.delete(`/users/${id}`),
  // Archive/Restore functionality
  getArchived: () => apiService.get('/users/archived/list'),
  restore: (id) => apiService.put(`/users/${id}/restore`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiService.get('/dashboard/stats'),
  getRecentActivities: () => apiService.get('/dashboard/activities'),
};

// Export the main API service
export default apiService;
