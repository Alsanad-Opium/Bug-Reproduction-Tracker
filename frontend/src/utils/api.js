// API client utility for BRT (Bug Reproduction Tracker)

const getHeaders = () => {
  const token = localStorage.getItem('brt_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Session expired or token invalid
    localStorage.removeItem('brt_token');
    localStorage.removeItem('brt_user');
    // Trigger custom event or redirect
    window.dispatchEvent(new Event('auth-unauthorized'));
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  // Handle empty or 204 response
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const api = {
  // Auth endpoints
  login: async (email, password) => {
    const res = await fetch('/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  register: async (name, email, password, role = 'TESTER') => {
    const res = await fetch('/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    return handleResponse(res);
  },

  getCurrentUser: async () => {
    const res = await fetch('/auth/me', {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Project endpoints
  getProjects: async (page = 1, perPage = 10) => {
    const res = await fetch(`/api/projects?page=${page}&per_page=${perPage}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getProject: async (projectId) => {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createProject: async (name, description) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, description }),
    });
    return handleResponse(res);
  },

  updateProject: async (projectId, name, description) => {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name, description }),
    });
    return handleResponse(res);
  },

  // Bug endpoints
  getBugs: async (filters = {}, page = 1, perPage = 10) => {
    const params = new URLSearchParams({ page, per_page: perPage });
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const res = await fetch(`/api/bugs?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getBug: async (bugId) => {
    const res = await fetch(`/api/bugs/${bugId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createBug: async (bugData) => {
    const res = await fetch('/api/bugs', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bugData),
    });
    return handleResponse(res);
  },

  updateBugStatus: async (bugId, status) => {
    const res = await fetch(`/api/bugs/${bugId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  updateBugPriority: async (bugId, priority) => {
    const res = await fetch(`/api/bugs/${bugId}/priority`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ priority }),
    });
    return handleResponse(res);
  },

  // Reproduction endpoints
  logReproductionAttempt: async (bugId, result) => {
    const res = await fetch(`/api/bugs/${bugId}/attempt`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ result }),
    });
    return handleResponse(res);
  },

  getReproductionAttempts: async (bugId) => {
    const res = await fetch(`/api/bugs/${bugId}/attempt`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getReproductionScore: async (bugId) => {
    const res = await fetch(`/api/bugs/${bugId}/score`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Comments endpoints
  getComments: async (bugId) => {
    const res = await fetch(`/api/bugs/${bugId}/comments`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  addComment: async (bugId, content) => {
    const res = await fetch(`/api/bugs/${bugId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(res);
  },

  // User endpoints
  updateUserRole: async (userId, role) => {
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  }
};
