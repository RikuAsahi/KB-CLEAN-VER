/* Landing page interactions */
(function () {
	const body = document.body;
	const hamburger = document.getElementById('hamburger');
	const navDrawer = document.getElementById('navDrawer');
	const modalOverlay = document.getElementById('modalOverlay');
	const modalCategory = document.getElementById('modalCategory');
	const donateBtn = document.getElementById('donateBtn');

	let drawerOpen = false;
	let selectedNGOId = null;
	let selectedCategory = '';

	const categoryRoutes = {
		Education: 'EducCategory.html',
		Health: 'HealthCategory.html',
		'Natural Disaster': 'NaturalCategory.html',
		Community: 'CommunityCategory.html'
	};

	function setBodyLocked(locked) {
		body.style.overflow = locked ? 'hidden' : '';
	}

	function setDrawer(open) {
		if (!hamburger || !navDrawer) return;
		drawerOpen = open;
		hamburger.classList.toggle('open', open);
		navDrawer.classList.toggle('open', open);
		hamburger.setAttribute('aria-expanded', String(open));
		navDrawer.setAttribute('aria-hidden', String(!open));
	}

	function openDrawer() {
		setDrawer(true);
		setBodyLocked(true);
	}

	function closeDrawer() {
		setDrawer(false);
		if (!modalOverlay || !modalOverlay.classList.contains('open')) {
			setBodyLocked(false);
		}
	}

	function showReveals() {
		const revealEls = document.querySelectorAll('.reveal');
		if (!revealEls.length) return;

		if (!('IntersectionObserver' in window)) {
			revealEls.forEach((el) => el.classList.add('visible'));
			return;
		}

		const observer = new IntersectionObserver(
			(entries, io) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					entry.target.classList.add('visible');
					io.unobserve(entry.target);
				});
			},
			{ threshold: 0.12 }
		);

		revealEls.forEach((el) => observer.observe(el));
	}

	function renderStats() {
		const nums = document.querySelectorAll('.stats-strip .stat-num');
		const labels = document.querySelectorAll('.stats-strip .stat-label');
		if (nums.length < 2 || labels.length < 2) return;

	
	}

	function openModal(categoryName) {
		if (!modalOverlay) return;
		selectedCategory = categoryName;
		selectedNGOId = null;

		if (modalCategory) {
			modalCategory.textContent = categoryName;
		}

		const ngoCards = modalOverlay.querySelectorAll('.ngo-card');
		ngoCards.forEach((card) => card.classList.remove('selected'));
		if (donateBtn) donateBtn.disabled = true;

		modalOverlay.classList.add('open');
		setBodyLocked(true);
	}

	function closeModal() {
		if (!modalOverlay) return;
		modalOverlay.classList.remove('open');
		if (!drawerOpen) {
			setBodyLocked(false);
		}
	}

	function selectNGO(ngoId) {
		if (!modalOverlay) return;
		selectedNGOId = ngoId;

		modalOverlay.querySelectorAll('.ngo-card').forEach((card) => {
			card.classList.toggle('selected', card.id === ngoId);
		});

		if (donateBtn) donateBtn.disabled = false;
	}

	function proceedDonate() {
		if (!selectedCategory || !selectedNGOId) return;

		const route = categoryRoutes[selectedCategory] || 'Campaign.html';
		const payload = {
			category: selectedCategory,
			ngoId: selectedNGOId,
			ts: Date.now()
		};

		sessionStorage.setItem('kb_donation_context', JSON.stringify(payload));
		window.location.href = route;
	}

	function goToCategory(categoryName) {
		openModal(categoryName);
	}

	function handleOverlayClick(event) {
		if (event.target === modalOverlay) closeModal();
	}

	function toggleFAQ(button) {
		const item = button.closest('.faq-item');
		if (!item) return;

		const isOpen = item.classList.contains('open');
		item.classList.toggle('open', !isOpen);
		button.setAttribute('aria-expanded', String(!isOpen));

		const bodyEl = item.querySelector('.faq-body');
		if (bodyEl) {
			bodyEl.setAttribute('aria-hidden', String(isOpen));
		}
	}

	if (hamburger) {
		hamburger.addEventListener('click', function () {
			if (drawerOpen) {
				closeDrawer();
			} else {
				openDrawer();
			}
		});
	}

	window.addEventListener('resize', function () {
		if (window.innerWidth > 768 && drawerOpen) {
			closeDrawer();
		}
	});

	document.addEventListener('keydown', function (event) {
		if (event.key !== 'Escape') return;
		if (drawerOpen) closeDrawer();
		if (modalOverlay && modalOverlay.classList.contains('open')) closeModal();
	});

	window.closeDrawer = closeDrawer;
	window.goToCategory = goToCategory;
	window.closeModal = closeModal;
	window.selectNGO = selectNGO;
	window.proceedDonate = proceedDonate;
	window.handleOverlayClick = handleOverlayClick;
	window.toggleFAQ = toggleFAQ;

	renderStats();
	showReveals();
})();
