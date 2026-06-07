const API_BASE = '/api/auth';

/**
 * Đăng nhập user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{_id, email, fullName, role, phone, token}>}
 */
export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Đăng nhập thất bại');
  }

  return data;
};

/**
 * Lấy thông tin user hiện tại (cần token)
 * @param {string} token
 * @returns {Promise<Object>}
 */
export const getMe = async (token) => {
  const res = await fetch(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Không thể lấy thông tin user');
  }

  return data;
};
