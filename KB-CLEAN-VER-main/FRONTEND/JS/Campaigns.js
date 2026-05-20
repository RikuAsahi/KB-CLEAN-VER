/* Campaign Detail Page with API Integration */
(function () {
	const state = {
		campaign: null,
		donationAmount: 2000,
		tipPercent: 5,
		payMethod: 'card',
		likeCount: 0,
		liked: false,
		loading: false
	};

	function qs(id) {
		return document.getElementById(id);
	}

	function fmtMoney(value) {
		return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0));
	}

	function setText(id, value) {
		const el = qs(id);
		if (el) el.textContent = value;
	}

	function showLoading(show = true) {
		const loader = qs('campaignLoader');
		if (loader) loader.style.display = show ? 'flex' : 'none';
		state.loading = show;
	}

	async function loadCampaign() {
		try {
			showLoading(true);

			// Get campaign ID from URL or session storage
			const campaignId = sessionStorage.getItem('kb.selected.campaign.id');
			if (!campaignId) {
				ToastHelper.error('Campaign not found');
				window.location.href = 'Landingpage.html';
				return;
			}

			const response = await CampaignAPI.getById(campaignId);
			state.campaign = response.campaign;

			fillCampaignInfo();
			fillPayoutDetails();
			updateDonSummary();
			selectPayMethod('card');

			// Load donation stats
			await loadDonationStats();
		} catch (error) {
			ToastHelper.error('Failed to load campaign: ' + error.message);
			console.error('Error:', error);
			setTimeout(() => {
				window.location.href = 'Landingpage.html';
			}, 2000);
		} finally {
			showLoading(false);
		}
	}

	async function loadDonationStats() {
		try {
			const response = await DonationAPI.getCampaignStats(state.campaign.id);
			const stats = response.stats;

			setText('totalDonations', stats.totalDonations || 0);
			setText('totalRaised', fmtMoney(stats.totalAmount || 0));

			// Update progress bar
			const progress = ((state.campaign.currentAmount || 0) / (state.campaign.targetAmount || 1)) * 100;
			const progressBar = qs('progressBar');
			if (progressBar) progressBar.style.width = Math.min(progress, 100) + '%';
		} catch (error) {
			console.log('Failed to load stats:', error.message);
		}
	}

	function fillCampaignInfo() {
		const campaign = state.campaign;
		if (!campaign) return;

		setText('heroTitle', campaign.title || 'Campaign');
		setText('heroDesc', campaign.description || 'Campaign details will be shown once available.');
		setText('successCampaign', campaign.title || 'Campaign');

		// Set campaign image
		const heroImage = qs('heroImage');
		if (heroImage) {
			heroImage.src = campaign.imageUrl || 'https://via.placeholder.com/1200x400?text=Campaign';
		}

		// Update progress
		const progress = ((campaign.currentAmount || 0) / (campaign.targetAmount || 1)) * 100;
		setText('campaignProgress', Math.round(progress) + '%');
		setText('campaignRaised', fmtMoney(campaign.currentAmount || 0));
		setText('campaignGoal', fmtMoney(campaign.targetAmount || 0));
	}

	function fillPayoutDetails() {
		const campaign = state.campaign;
		if (!campaign) return;

		setText('bankName', campaign.bankName || 'Not provided');
		setText('gcashAccount', campaign.gcashNumber || 'Not provided');
		setText('paymayaAccount', campaign.paymayaNumber || 'Not provided');
	}

	function taxAmount(amount) {
		return amount * 0.01;
	}

	function tipAmount(amount, tipPercent) {
		return amount * (tipPercent / 100);
	}

	function totalAmount() {
		const donation = Number(state.donationAmount || 0);
		const tip = tipAmount(donation, state.tipPercent);
		const tax = taxAmount(donation);
		return donation + tip + tax;
	}

	function updateDonSummary() {
		const input = qs('donAmtInput');
		const amt = Number(input?.value || 0);
		state.donationAmount = amt;

		const valid = amt >= 50;
		qs('donAmtErr')?.classList.toggle('show', !valid);

		const tip = tipAmount(amt, state.tipPercent);
		const tax = taxAmount(amt);
		const total = amt + tip + tax;

		setText('sumDon', fmtMoney(amt));
		setText('sumTip', fmtMoney(tip));
		setText('sumTax', fmtMoney(tax));
		setText('sumTotal', fmtMoney(total));
		setText('gcashAmt', fmtMoney(total));
		setText('paymayaAmt', fmtMoney(total));
	}

	function selectPreset(button, amount) {
		document.querySelectorAll('.preset-btn').forEach((btn) => btn.classList.remove('active'));
		if (button) button.classList.add('active');
		if (qs('donAmtInput')) qs('donAmtInput').value = String(amount);
		updateDonSummary();
	}

	function selectTip(button, percent) {
		document.querySelectorAll('.tip-btn').forEach((btn) => btn.classList.remove('active'));
		if (button) button.classList.add('active');
		state.tipPercent = Number(percent || 0);

		const sumTipLabel = qs('sumTip')?.closest('.summary-row');
		if (sumTipLabel) {
			const first = sumTipLabel.querySelector('span');
			if (first) first.textContent = `Platform Tip (${state.tipPercent}%)`;
		}
		updateDonSummary();
	}

	function openModal(id) {
		// Check authentication
		if (id === 'donationModal' && !AuthState.isAuthenticated) {
			qs('loginNotice')?.classList.add('open');
			return;
		}
		qs(id)?.classList.add('open');
	}

	function closeModal(id) {
		qs(id)?.classList.remove('open');
	}

	function goToPayment() {
		if (Number(state.donationAmount || 0) < 50) {
			qs('donAmtErr')?.classList.add('show');
			return;
		}
		closeModal('donationModal');
		openModal('paymentModal');
	}

	async function processPayment() {
		try {
			if (!state.campaign) return;

			// Create donation
			const donation = await DonationAPI.create({
				campaignId: state.campaign.id,
				amount: state.donationAmount,
				paymentMethod: state.payMethod,
				message: qs('donationMessage')?.value || null
			});

			setText('successDon', fmtMoney(state.donationAmount));
			setText('successTip', fmtMoney(tipAmount(state.donationAmount, state.tipPercent)));
			setText('successTax', fmtMoney(taxAmount(state.donationAmount)));
			setText('successTotal', fmtMoney(totalAmount()));

			closeModal('paymentModal');
			openModal('successModal');

			// Reload stats
			setTimeout(loadDonationStats, 1000);
		} catch (error) {
			ToastHelper.error('Payment failed: ' + error.message);
		}
	}

	function selectPayMethod(method) {
		state.payMethod = method;
		['card', 'gcash', 'paymaya', 'bank_transfer'].forEach((m) => {
			qs(`pm-${m}`)?.classList.toggle('active', m === method);
		});

		if (qs('cardFields')) qs('cardFields').style.display = method === 'card' ? '' : 'none';
		if (qs('gcashFields')) qs('gcashFields').style.display = method === 'gcash' ? '' : 'none';
		if (qs('paymayaFields')) qs('paymayaFields').style.display = method === 'paymaya' ? '' : 'none';
		if (qs('bankFields')) qs('bankFields').style.display = method === 'bank_transfer' ? '' : 'none';
	}

	function toggleLike() {
		state.liked = !state.liked;
		state.likeCount += state.liked ? 1 : -1;
		if (state.likeCount < 0) state.likeCount = 0;
		qs('likeBtn')?.classList.toggle('active', state.liked);
		setText('likeTxt', state.liked ? 'Liked' : 'Like');
		setText('likeCount', `(${state.likeCount})`);
	}

	function initDrawer() {
		const drawer = qs('navDrawer');
		const hamburger = qs('hamburger');
		if (!drawer || !hamburger) return;

		hamburger.addEventListener('click', function () {
			const open = !drawer.classList.contains('open');
			drawer.classList.toggle('open', open);
			hamburger.classList.toggle('open', open);
		});
	}

	function formatCard(input) {
		const digits = String(input.value || '').replace(/\D/g, '').slice(0, 16);
		input.value = digits.replace(/(.{4})/g, '$1 ').trim();
	}

	function formatExpiry(input) {
		const digits = String(input.value || '').replace(/\D/g, '').slice(0, 4);
		input.value = digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
	}

	function init() {
		initDrawer();
		loadCampaign();
	}

	// Expose functions to window
	window.openModal = openModal;
	window.closeModal = closeModal;
	window.selectPreset = selectPreset;
	window.selectTip = selectTip;
	window.updateDonSummary = updateDonSummary;
	window.goToPayment = goToPayment;
	window.processPayment = processPayment;
	window.selectPayMethod = selectPayMethod;
	window.toggleLike = toggleLike;
	window.formatCard = formatCard;
	window.formatExpiry = formatExpiry;

	document.addEventListener('DOMContentLoaded', init);
})();
