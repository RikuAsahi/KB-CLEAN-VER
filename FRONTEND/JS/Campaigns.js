(function () {
	const SELECTED_CAMPAIGN_KEY = 'kb.selected.campaign';

	const state = {
		campaign: null,
		donationAmount: 2000,
		tipPercent: 5,
		payMethod: 'card',
		likeCount: 0,
		liked: false
	};

	function qs(id) {
		return document.getElementById(id);
	}

	function fmtMoney(value) {
		return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0));
	}

	function readCampaign() {
		const raw = sessionStorage.getItem(SELECTED_CAMPAIGN_KEY);
		if (!raw) return null;
		try {
			return JSON.parse(raw);
		} catch (_error) {
			return null;
		}
	}

	function setText(id, value) {
		const el = qs(id);
		if (el) el.textContent = value;
	}

	function fillCampaignInfo() {
		const campaign = state.campaign;
		if (!campaign) return;

		setText('heroTitle', campaign.title || 'Campaign');
		setText('heroDesc', campaign.description || 'Campaign details will be shown once available.');
		setText('heroNgoName', campaign.ngoName || 'NGO Partner');
		setText('successCampaign', campaign.title || 'Campaign');
		setText('successNgo', campaign.ngoName || 'NGO Partner');
	}

	function fillPayoutDetails() {
		const payout = (state.campaign && state.campaign.payout) || {};

		setText('bankName', payout.bankName && payout.bankName !== 'Not provided' ? payout.bankName : 'Not provided');
		setText('bankAccount', payout.bankAccount && payout.bankAccount !== 'Not provided' ? payout.bankAccount : 'Not provided');
		setText('bankPayee', payout.bankPayee && payout.bankPayee !== 'Not provided' ? payout.bankPayee : (state.campaign?.ngoName || 'Not provided'));
		setText('gcashAccount', payout.gcashNumber && payout.gcashNumber !== 'Not provided' ? payout.gcashNumber : 'Not provided');
		setText('paymayaAccount', payout.paymayaNumber && payout.paymayaNumber !== 'Not provided' ? payout.paymayaNumber : 'Not provided');

		const bankDetails = qs('bankDetails');
		if (bankDetails) {
			const hasBank = payout.bankName && payout.bankAccount && payout.bankPayee && payout.bankName !== 'Not provided';
			bankDetails.style.opacity = hasBank ? '1' : '0.55';
		}
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
		qs(id)?.classList.add('open');
	}

	function closeModal(id) {
		qs(id)?.classList.remove('open');
	}

	function handleDonateClick() {
		openModal('donationModal');
	}

	function goToPayment() {
		if (Number(state.donationAmount || 0) < 50) {
			qs('donAmtErr')?.classList.add('show');
			return;
		}
		closeModal('donationModal');
		openModal('paymentModal');
	}

	function selectPayMethod(method) {
		state.payMethod = method;
		['card', 'gcash', 'paymaya'].forEach((m) => {
			qs(`pm-${m}`)?.classList.toggle('active', m === method);
		});

		if (qs('cardFields')) qs('cardFields').style.display = method === 'card' ? '' : 'none';
		if (qs('gcashFields')) qs('gcashFields').style.display = method === 'gcash' ? '' : 'none';
		if (qs('paymayaFields')) qs('paymayaFields').style.display = method === 'paymaya' ? '' : 'none';
	}

	function processPayment() {
		setText('successDon', fmtMoney(state.donationAmount));
		setText('successTip', fmtMoney(tipAmount(state.donationAmount, state.tipPercent)));
		setText('successTax', fmtMoney(taxAmount(state.donationAmount)));
		setText('successTotal', fmtMoney(totalAmount()));

		closeModal('paymentModal');
		openModal('successModal');
	}

	function toggleLike() {
		state.liked = !state.liked;
		state.likeCount += state.liked ? 1 : -1;
		if (state.likeCount < 0) state.likeCount = 0;
		qs('likeBtn')?.classList.toggle('active', state.liked);
		setText('likeTxt', state.liked ? 'Liked' : 'Like');
		setText('likeCount', `(${state.likeCount})`);
	}

	function closeLoginNotice() {
		qs('loginNotice')?.classList.remove('open');
	}

	function formatCard(input) {
		const digits = String(input.value || '').replace(/\D/g, '').slice(0, 16);
		input.value = digits.replace(/(.{4})/g, '$1 ').trim();
	}

	function formatExpiry(input) {
		const digits = String(input.value || '').replace(/\D/g, '').slice(0, 4);
		input.value = digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
	}

	function submitReport() {
		const reason = String(qs('reportReason')?.value || '').trim();
		const details = String(qs('reportDetails')?.value || '').trim();
		const reasonErr = qs('reportReasonErr');
		const detailsErr = qs('reportDetailsErr');

		if (reasonErr) reasonErr.classList.toggle('show', !reason);
		if (detailsErr) detailsErr.classList.toggle('show', details.length < 10);
		if (!reason || details.length < 10) return;

		if (qs('reportFormView')) qs('reportFormView').style.display = 'none';
		if (qs('reportConfirmView')) qs('reportConfirmView').style.display = '';
	}

	function resetReport() {
		if (qs('reportFormView')) qs('reportFormView').style.display = '';
		if (qs('reportConfirmView')) qs('reportConfirmView').style.display = 'none';
		if (qs('reportReason')) qs('reportReason').value = '';
		if (qs('reportDetails')) qs('reportDetails').value = '';
		qs('reportReasonErr')?.classList.remove('show');
		qs('reportDetailsErr')?.classList.remove('show');
	}

	function showToast(message) {
		const toast = qs('toast');
		if (!toast) return;
		setText('toastMsg', message);
		toast.classList.add('show');
		setTimeout(function () {
			toast.classList.remove('show');
		}, 1800);
	}

	function shareTo(platform) {
		const url = encodeURIComponent(window.location.href);
		const title = encodeURIComponent(state.campaign?.title || 'Kapitbisig Campaign');

		if (platform === 'facebook') {
			window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
		} else if (platform === 'twitter') {
			window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
		} else {
			showToast('Share link copied for Viber.');
			copyLink();
		}
	}

	function copyLink() {
		const input = qs('shareLinkInput');
		if (!input) return;
		input.select();
		input.setSelectionRange(0, 99999);
		try {
			document.execCommand('copy');
			showToast('Link copied!');
		} catch (_error) {
			showToast('Copy failed.');
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
		});
	}

	function init() {
		state.campaign = readCampaign();
		fillCampaignInfo();
		fillPayoutDetails();
		updateDonSummary();
		selectPayMethod('card');
		initDrawer();
	}

	window.toggleLike = toggleLike;
	window.openModal = openModal;
	window.closeModal = closeModal;
	window.closeLoginNotice = closeLoginNotice;
	window.handleDonateClick = handleDonateClick;
	window.selectPreset = selectPreset;
	window.selectTip = selectTip;
	window.updateDonSummary = updateDonSummary;
	window.goToPayment = goToPayment;
	window.selectPayMethod = selectPayMethod;
	window.processPayment = processPayment;
	window.formatCard = formatCard;
	window.formatExpiry = formatExpiry;
	window.submitReport = submitReport;
	window.resetReport = resetReport;
	window.shareTo = shareTo;
	window.copyLink = copyLink;

	init();
})();
