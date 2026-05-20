/* User Profile Page */
(function () {
	const state = {
		user: null,
		ngoProfile: null,
		donations: [],
		loading: false
	};

	function qs(id) {
		return document.getElementById(id);
	}

	function setText(id, value) {
		const el = qs(id);
		if (el) el.textContent = value;
	}

	function fmtMoney(value) {
		return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0));
	}

	function showLoading(show = true) {
		const loader = qs('profileLoader');
		if (loader) loader.style.display = show ? 'flex' : 'none';
		state.loading = show;
	}

	async function loadUserProfile() {
		try {
			showLoading(true);
			await AuthState.init();

			state.user = AuthState.getUser();
			if (!state.user) {
				window.location.href = 'SignIn.html';
				return;
			}

			displayUserProfile();
			await loadUserDonations();

			// Load NGO profile if user is NGO admin
			if (state.user.role === 'ngo_admin') {
				await loadNgoProfile();
			}
		} catch (error) {
			ToastHelper.error('Failed to load profile: ' + error.message);
			console.error('Error:', error);
		} finally {
			showLoading(false);
		}
	}

	function displayUserProfile() {
		if (!state.user) return;

		setText('userName', state.user.fullName || state.user.firstName + ' ' + state.user.lastName);
		setText('userEmail', state.user.email);
		setText('userRole', state.user.role.replace(/_/g, ' ').toUpperCase());
		setText('userJoinDate', new Date(state.user.createdAt).toLocaleDateString('en-PH'));

		// Set role badge color
		const roleBadge = qs('roleBadge');
		if (roleBadge) {
			const roleColors = {
				donor: '#27AE60',
				ngo_admin: '#F39C12',
				admin: '#3498DB',
				superadmin: '#E74C3C'
			};
			roleBadge.style.background = roleColors[state.user.role] || '#999';
		}
	}

	async function loadNgoProfile() {
		try {
			const response = await NGOAPI.getMyProfile();
			state.ngoProfile = response.profile;
			displayNgoProfile();
		} catch (error) {
			// NGO profile doesn't exist yet
			console.log('No NGO profile found');
		}
	}

	function displayNgoProfile() {
		if (!state.ngoProfile) return;

		const ngoSection = qs('ngoProfileSection');
		if (!ngoSection) return;

		ngoSection.style.display = 'block';

		setText('ngoName', state.ngoProfile.name);
		setText('ngoDesc', state.ngoProfile.description || 'No description provided');
		setText('ngoRegNum', state.ngoProfile.registrationNumber);
		setText('ngoStatus', state.ngoProfile.verificationStatus.toUpperCase());

		// Set verification status color
		const statusEl = qs('ngoStatus');
		if (statusEl) {
			const statusColors = {
				pending: '#F39C12',
				verified: '#27AE60',
				rejected: '#E74C3C'
			};
			statusEl.style.color = statusColors[state.ngoProfile.verificationStatus] || '#999';
		}
	}

	async function loadUserDonations() {
		try {
			const response = await DonationAPI.getMyDonations(10, 0);
			state.donations = response.donations || [];
			displayDonations();
		} catch (error) {
			console.error('Failed to load donations:', error);
			state.donations = [];
		}
	}

	function displayDonations() {
		const container = qs('donationsContainer');
		if (!container) return;

		container.innerHTML = '';

		if (state.donations.length === 0) {
			container.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">No donations yet</p>';
			return;
		}

		state.donations.forEach((donation) => {
			const item = document.createElement('div');
			item.className = 'donation-item';
			item.style.cssText = `
				padding: 1rem;
				border-bottom: 1px solid #eee;
				display: flex;
				justify-content: space-between;
				align-items: center;
			`;

			const statusColor = {
				pending: '#F39C12',
				completed: '#27AE60',
				failed: '#E74C3C',
				refunded: '#95A5A6'
			}[donation.status] || '#999';

			item.innerHTML = `
				<div>
					<div style="font-weight: 600; margin-bottom: 0.25rem;">Campaign #${donation.campaignId}</div>
					<div style="font-size: 0.875rem; color: #666;">
						${new Date(donation.createdAt).toLocaleDateString('en-PH')}
					</div>
				</div>
				<div style="text-align: right;">
					<div style="font-weight: 600; color: #27AE60;">${fmtMoney(donation.amount)}</div>
					<div style="font-size: 0.875rem; color: ${statusColor}; font-weight: 600;">
						${donation.status.toUpperCase()}
					</div>
				</div>
			`;

			container.appendChild(item);
		});
	}

	async function handleLogout() {
		if (!confirm('Are you sure you want to log out?')) return;

		try {
			showLoading(true);
			await AuthState.logout();
			ToastHelper.success('Logged out successfully');
			setTimeout(() => {
				window.location.href = 'Landingpage.html';
			}, 500);
		} catch (error) {
			ToastHelper.error('Logout failed: ' + error.message);
			showLoading(false);
		}
	}

	// Initialize drawer
	function initDrawer() {
		const hamburger = qs('hamburger');
		const navDrawer = qs('navDrawer');
		if (!hamburger || !navDrawer) return;

		hamburger.addEventListener('click', function () {
			const open = !navDrawer.classList.contains('open');
			navDrawer.classList.toggle('open', open);
			hamburger.classList.toggle('open', open);
		});
	}

	function init() {
		initDrawer();
		loadUserProfile();
	}

	// Expose functions to window
	window.handleLogout = handleLogout;

	// Load on DOM ready
	document.addEventListener('DOMContentLoaded', init);
})();
