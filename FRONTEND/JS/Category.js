(function () {
	const CAMPAIGNS_KEY = 'kb.campaigns.created';
	const SELECTED_CAMPAIGN_KEY = 'kb.selected.campaign';

	const state = {
		category: String(document.body.getAttribute('data-category-name') || '').trim(),
		search: '',
		status: '',
		sort: 'newest',
		allCampaigns: []
	};

	function qs(id) {
		return document.getElementById(id);
	}

	function fmtMoney(value) {
		return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value || 0);
	}

	function readCreatedCampaigns() {
		const raw = localStorage.getItem(CAMPAIGNS_KEY);
		if (!raw) return [];
		try {
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		} catch (_error) {
			return [];
		}
	}

	function seedCampaignsForCategory() {
		const all = readCreatedCampaigns();
		return all.filter((c) => String(c.category || '').toLowerCase() === state.category.toLowerCase());
	}

	function setHeroStats(campaigns) {
		const total = campaigns.reduce((sum, c) => sum + Number(c.goalAmount || 0), 0);
		if (qs('heroTotal')) qs('heroTotal').textContent = campaigns.length ? fmtMoney(total) : '--';
		if (qs('heroDonors')) qs('heroDonors').textContent = campaigns.length ? '--' : '--';
		if (qs('heroCampaigns')) qs('heroCampaigns').textContent = String(campaigns.length);
	}

	function getFilteredCampaigns() {
		const search = state.search.toLowerCase();
		let rows = state.allCampaigns.filter((c) => {
			const title = String(c.title || '').toLowerCase();
			const desc = String(c.description || '').toLowerCase();
			const status = String(c.status || '').toLowerCase();
			const statusMatch = !state.status || status === state.status;
			return statusMatch && (!search || title.includes(search) || desc.includes(search));
		});

		if (state.sort === 'oldest') {
			rows = rows.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
		} else if (state.sort === 'most-funded') {
			rows = rows.sort((a, b) => Number(b.goalAmount || 0) - Number(a.goalAmount || 0));
		} else if (state.sort === 'least-funded') {
			rows = rows.sort((a, b) => Number(a.goalAmount || 0) - Number(b.goalAmount || 0));
		} else {
			rows = rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
		}

		return rows;
	}

	function campaignCardTemplate(campaign) {
		const payout = campaign.payout || {};
		const hasBank = payout.bankName && payout.bankAccount && payout.bankPayee && payout.bankName !== 'Not provided';
		const hasGCash = payout.gcashNumber && payout.gcashNumber !== 'Not provided';
		const hasPayMaya = payout.paymayaNumber && payout.paymayaNumber !== 'Not provided';

		return `
			<article class="camp-card reveal">
				<div class="camp-card-head">
					<span class="badge badge-${String(campaign.status || 'pending').toLowerCase()}">${campaign.status || 'pending'}</span>
					<span class="camp-date">${new Date(campaign.createdAt || Date.now()).toLocaleDateString()}</span>
				</div>
				<h3 class="camp-title">${campaign.title}</h3>
				<p class="camp-desc">${campaign.description || 'No campaign description available yet.'}</p>
				<div class="camp-meta">Target: <strong>${fmtMoney(campaign.goalAmount || 0)}</strong></div>
				<div class="camp-meta">NGO: <strong>${campaign.ngoName || 'NGO Account'}</strong></div>
				<div class="camp-meta" style="margin-top:8px">Donation Channels:</div>
				<ul style="margin:4px 0 10px 18px;color:var(--text-soft);font-size:12px;line-height:1.6">
					<li>Bank Transfer: ${hasBank ? 'Available' : 'Not provided'}</li>
					<li>GCash: ${hasGCash ? 'Available' : 'Not provided'}</li>
					<li>PayMaya: ${hasPayMaya ? 'Available' : 'Not provided'}</li>
				</ul>
				<button class="btn btn-primary btn-sm" onclick="openCampaignDonation('${campaign.id}')">Donate to this Campaign</button>
			</article>
		`;
	}

	function renderCampaigns() {
		const campaigns = getFilteredCampaigns();
		const grid = qs('campaignsGrid');
		const featured = qs('featuredGrid');
		const results = qs('resultsLabel');

		if (results) {
			results.textContent = campaigns.length
				? `${campaigns.length} campaign(s) available in ${state.category}.`
				: `No ${state.category.toLowerCase()} campaigns yet. Create one from NGO Dashboard.`;
		}

		if (featured) {
			featured.innerHTML = campaigns.slice(0, 2).map(campaignCardTemplate).join('') ||
				'<div class="empty-state"><h3>No featured campaigns yet</h3><p>NGO-created campaigns will appear here once submitted.</p></div>';
		}

		if (grid) {
			grid.innerHTML = campaigns.map(campaignCardTemplate).join('') ||
				'<div class="empty-state"><h3>No campaigns yet</h3><p>There are no campaigns in this category yet.</p></div>';
		}
	}

	function filterCampaigns() {
		state.search = String(qs('searchInput')?.value || '').trim();
		state.status = String(qs('filterStatus')?.value || '').trim().toLowerCase();
		state.sort = String(qs('filterSort')?.value || 'newest').trim();
		renderCampaigns();
	}

	function openCampaignDonation(campaignId) {
		const campaign = state.allCampaigns.find((c) => String(c.id) === String(campaignId));
		if (!campaign) return;
		sessionStorage.setItem(SELECTED_CAMPAIGN_KEY, JSON.stringify(campaign));
		window.location.href = 'Campaign.html';
	}

	function closeDrawer() {
		const drawer = qs('navDrawer');
		const hamburger = qs('hamburger');
		if (!drawer || !hamburger) return;
		drawer.classList.remove('open');
		hamburger.classList.remove('open');
		hamburger.setAttribute('aria-expanded', 'false');
		drawer.setAttribute('aria-hidden', 'true');
	}

	function openNgoModal() {
		const listing = qs('campaignsGrid');
		if (listing) {
			listing.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function initDrawer() {
		const drawer = qs('navDrawer');
		const hamburger = qs('hamburger');
		if (!drawer || !hamburger) return;

		hamburger.addEventListener('click', function () {
			const open = !drawer.classList.contains('open');
			drawer.classList.toggle('open', open);
			hamburger.classList.toggle('open', open);
			hamburger.setAttribute('aria-expanded', String(open));
			drawer.setAttribute('aria-hidden', String(!open));
		});
	}

	function init() {
		state.allCampaigns = seedCampaignsForCategory();
		setHeroStats(state.allCampaigns);
		renderCampaigns();
		initDrawer();
	}

	window.filterCampaigns = filterCampaigns;
	window.openCampaignDonation = openCampaignDonation;
	window.closeDrawer = closeDrawer;
	window.openNgoModal = openNgoModal;

	init();
})();
