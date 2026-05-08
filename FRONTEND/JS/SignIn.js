/* Sign-in page interactions */
(function () {
	const API_BASE = window.KB_API_BASE || 'http://localhost:4000';
	const hamburger = document.getElementById('hamburger');
	const navDrawer = document.getElementById('navDrawer');
	const pwdToggle = document.getElementById('pwdToggle');
	const passwordInput = document.getElementById('password');
	const signinForm = document.getElementById('signinForm');
	const socialButtons = document.querySelectorAll('.js-social-auth');

	function showToast(message, type) {
		const toast = document.createElement('div');
		toast.textContent = message;
		toast.style.position = 'fixed';
		toast.style.right = '16px';
		toast.style.bottom = '16px';
		toast.style.zIndex = '9999';
		toast.style.maxWidth = '320px';
		toast.style.padding = '12px 14px';
		toast.style.borderRadius = '10px';
		toast.style.color = '#fff';
		toast.style.font = "600 12px 'DM Sans', sans-serif";
		toast.style.letterSpacing = '0.2px';
		toast.style.boxShadow = '0 12px 28px rgba(0,0,0,.18)';
		toast.style.background = type === 'error' ? '#d94f4f' : '#1B2A4A';
		document.body.appendChild(toast);
		setTimeout(function () { toast.remove(); }, 2400);
	}

	function hideErrors() {
		document.querySelectorAll('.error-msg.show').forEach(function (el) {
			el.classList.remove('show');
		});
	}

	function setDrawer(open) {
		if (!hamburger || !navDrawer) return;
		hamburger.classList.toggle('open', open);
		navDrawer.classList.toggle('open', open);
		hamburger.setAttribute('aria-expanded', String(open));
	}

	if (hamburger && navDrawer) {
		hamburger.addEventListener('click', function () {
			const open = !navDrawer.classList.contains('open');
			setDrawer(open);
		});
	}

	if (pwdToggle && passwordInput) {
		pwdToggle.addEventListener('click', function () {
			const hidden = passwordInput.type === 'password';
			passwordInput.type = hidden ? 'text' : 'password';
		});
	}

	if (signinForm) {
		signinForm.addEventListener('submit', async function (event) {
			event.preventDefault();
			hideErrors();

			const email = document.getElementById('email');
			const password = document.getElementById('password');
			let valid = true;

			if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
				const emailErr = document.getElementById('emailErr');
				if (emailErr) emailErr.classList.add('show');
				valid = false;
			}

			if (!password || !password.value.trim()) {
				const pwdErr = document.getElementById('pwdErr');
				if (pwdErr) pwdErr.classList.add('show');
				valid = false;
			}

			if (!valid) return;

			try {
				const response = await fetch(`${API_BASE}/auth/signin`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({
						email: email.value.trim(),
						password: password.value
					})
				});

				const data = await response.json().catch(function () { return {}; });
				if (!response.ok) {
					showToast(data.message || 'Unable to sign in right now.', 'error');
					return;
				}

				showToast('Signed in successfully.', 'info');
				setTimeout(function () {
					window.location.href = 'Landingpage.html';
				}, 400);
			} catch (_error) {
				showToast('Backend is unreachable. Start the auth server first.', 'error');
			}
		});
	}

	socialButtons.forEach(function (button) {
		button.addEventListener('click', function (event) {
			event.preventDefault();
			const provider = button.getAttribute('data-provider');
			if (provider === 'google') {
				window.location.href = `${API_BASE}/auth/google`;
			} else if (provider === 'facebook') {
				window.location.href = `${API_BASE}/auth/facebook`;
			} else {
				showToast('Social sign-in provider is not configured.', 'error');
			}
		});
	});

	const query = new URLSearchParams(window.location.search);
	if (query.get('oauth') === 'failed') {
		showToast('OAuth sign-in failed. Please try again.', 'error');
	}
})();
