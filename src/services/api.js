const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('hirenova_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Jobs API
export const jobsAPI = {
  getJobs: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });

    const res = await fetch(`${API_BASE_URL}/jobs?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getFeatured: async () => {
    const res = await fetch(`${API_BASE_URL}/jobs/featured`);
    return handleResponse(res);
  },

  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/jobs/categories`);
    return handleResponse(res);
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  create: async (jobData) => {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

// Applications API
export const applicationsAPI = {
  apply: async (jobId, data) => {
    const res = await fetch(`${API_BASE_URL}/applications/${jobId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getMyApplications: async () => {
    const res = await fetch(`${API_BASE_URL}/applications/my`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getJobApplications: async (jobId) => {
    const res = await fetch(`${API_BASE_URL}/applications/job/${jobId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  updateStatus: async (applicationId, status, notes) => {
    const res = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse(res);
  },
};

// User API (Profile, Settings, Bookmarks, Dashboard)
export const usersAPI = {
  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  updateSettings: async (settingsData) => {
    const res = await fetch(`${API_BASE_URL}/users/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settingsData),
    });
    return handleResponse(res);
  },

  toggleSaveJob: async (jobId) => {
    const res = await fetch(`${API_BASE_URL}/users/save-job/${jobId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getSavedJobs: async () => {
    const res = await fetch(`${API_BASE_URL}/users/saved-jobs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/users/dashboard-stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
