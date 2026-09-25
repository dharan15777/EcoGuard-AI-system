const API_BASE = '/api/v1';

export const apiClient = {
  async get(endpoint) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[ApiClient] GET ${endpoint} failed, falling back to mock state.`, err);
      return null;
    }
  },

  async post(endpoint, data) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.warn(`[ApiClient] POST ${endpoint} failed.`, err);
      return null;
    }
  },

  async patch(endpoint, data) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.warn(`[ApiClient] PATCH ${endpoint} failed.`, err);
      return null;
    }
  }
};
