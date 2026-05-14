/* ── KAPITBISIG API CLIENT ── */
const API_BASE = window.KB_API_BASE || 'http://localhost:5000';

async function apiFetch(endpoint, options = {}) {
	const defaults = {
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	};
	const finalOptions = Object.assign({}, defaults, options);
	if (options.headers) {
		finalOptions.headers = Object.assign({}, defaults.headers, options.headers);
	}

	const res = await fetch(API_BASE + endpoint, finalOptions);
	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		const error = new Error(data.message || `API error ${res.status}`);
		error.status = res.status;
		error.data = data;
		throw error;
	}

	return data;
}

/* ── AUTH API ── */
const AuthAPI = {
	signup: (firstName, lastName, email, password) =>
		apiFetch('/auth/signup', {
			method: 'POST',
			body: JSON.stringify({ firstName, lastName, email, password })
		}),

	signin: (email, password) =>
		apiFetch('/auth/signin', {
			method: 'POST',
			body: JSON.stringify({ email, password })
		}),

	getMe: () => apiFetch('/auth/me'),

	logout: () =>
		apiFetch('/auth/logout', {
			method: 'POST'
		})
};

/* ── CAMPAIGNS API ── */
const CampaignAPI = {
	list: (filters = {}) => {
		const params = new URLSearchParams();
		if (filters.status) params.append('status', filters.status);
		if (filters.category) params.append('category', filters.category);
		if (filters.search) params.append('search', filters.search);
		if (filters.limit) params.append('limit', filters.limit);
		if (filters.offset) params.append('offset', filters.offset);
		return apiFetch(`/campaigns?${params}`);
	},

	getById: (id) => apiFetch(`/campaigns/${id}`),

	create: (data) =>
		apiFetch('/campaigns', {
			method: 'POST',
			body: JSON.stringify(data)
		}),

	update: (id, data) =>
		apiFetch(`/campaigns/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),

	submitForApproval: (id) =>
		apiFetch(`/campaigns/${id}/submit`, {
			method: 'POST'
		}),

	approve: (id) =>
		apiFetch(`/campaigns/${id}/approve`, {
			method: 'POST'
		}),

	reject: (id, reason) =>
		apiFetch(`/campaigns/${id}/reject`, {
			method: 'POST',
			body: JSON.stringify({ reason })
		}),

	delete: (id) =>
		apiFetch(`/campaigns/${id}`, {
			method: 'DELETE'
		})
};

/* ── DONATIONS API ── */
const DonationAPI = {
	create: (data) =>
		apiFetch('/donations', {
			method: 'POST',
			body: JSON.stringify(data)
		}),

	getById: (id) => apiFetch(`/donations/${id}`),

	getMyDonations: (limit = 50, offset = 0) =>
		apiFetch(`/donations/my-donations?limit=${limit}&offset=${offset}`),

	getCampaignDonations: (campaignId, limit = 100, offset = 0) =>
		apiFetch(`/donations/campaign/${campaignId}/donations?limit=${limit}&offset=${offset}`),

	getCampaignStats: (campaignId) =>
		apiFetch(`/donations/campaign/${campaignId}/stats`)
};

/* ── NGO API ── */
const NGOAPI = {
	create: (data) =>
		apiFetch('/ngos', {
			method: 'POST',
			body: JSON.stringify(data)
		}),

	list: (limit = 50, offset = 0) =>
		apiFetch(`/ngos?limit=${limit}&offset=${offset}`),

	getVerified: (limit = 50, offset = 0) =>
		apiFetch(`/ngos/verified?limit=${limit}&offset=${offset}`),

	getById: (id) => apiFetch(`/ngos/${id}`),

	getMyProfile: () => apiFetch('/ngos/my-profile'),

	update: (id, data) =>
		apiFetch(`/ngos/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),

	delete: (id) =>
		apiFetch(`/ngos/${id}`, {
			method: 'DELETE'
		}),

	getPendingVerifications: (limit = 50, offset = 0) =>
		apiFetch(`/ngos/verification/pending?limit=${limit}&offset=${offset}`),

	verify: (id) =>
		apiFetch(`/ngos/${id}/verify`, {
			method: 'POST'
		}),

	reject: (id) =>
		apiFetch(`/ngos/${id}/reject`, {
			method: 'POST'
		})
};

/* ── ADMIN API ── */
const AdminAPI = {
	getAllUsers: (limit = 50, offset = 0) =>
		apiFetch(`/admin/users?limit=${limit}&offset=${offset}`),

	updateUserRole: (userId, role) =>
		apiFetch(`/admin/users/${userId}/role`, {
			method: 'PUT',
			body: JSON.stringify({ role })
		}),

	deleteUser: (userId) =>
		apiFetch(`/admin/users/${userId}`, {
			method: 'DELETE'
		}),

	getActivityLogs: (filters = {}) => {
		const params = new URLSearchParams();
		if (filters.adminId) params.append('adminId', filters.adminId);
		if (filters.entityType) params.append('entityType', filters.entityType);
		if (filters.action) params.append('action', filters.action);
		if (filters.startDate) params.append('startDate', filters.startDate);
		if (filters.endDate) params.append('endDate', filters.endDate);
		if (filters.limit) params.append('limit', filters.limit);
		if (filters.offset) params.append('offset', filters.offset);
		return apiFetch(`/admin/activity-logs?${params}`);
	},

	getMyActivityLogs: (limit = 50, offset = 0) =>
		apiFetch(`/admin/my-activity-logs?limit=${limit}&offset=${offset}`),

	getActivityLog: (id) => apiFetch(`/admin/activity-logs/${id}`)
};

/* ── AUTH STATE MANAGEMENT ── */
const AuthState = {
	currentUser: null,
	isAuthenticated: false,

	async init() {
		try {
			const response = await AuthAPI.getMe();
			this.currentUser = response.user;
			this.isAuthenticated = true;
		} catch {
			this.currentUser = null;
			this.isAuthenticated = false;
		}
	},

	async login(email, password) {
		const response = await AuthAPI.signin(email, password);
		this.currentUser = response.user;
		this.isAuthenticated = true;
		return response;
	},

	async register(firstName, lastName, email, password) {
		const response = await AuthAPI.signup(firstName, lastName, email, password);
		this.currentUser = response.user;
		this.isAuthenticated = true;
		return response;
	},

	async logout() {
		await AuthAPI.logout();
		this.currentUser = null;
		this.isAuthenticated = false;
	},

	getUser() {
		return this.currentUser;
	},

	isAdmin() {
		return this.currentUser && ['admin', 'superadmin'].includes(this.currentUser.role);
	},

	isNgoAdmin() {
		return this.currentUser && this.currentUser.role === 'ngo_admin';
	},

	isDonor() {
		return this.currentUser && this.currentUser.role === 'donor';
	}
};

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', () => AuthState.init());
