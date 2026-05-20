const campaignService = require('../services/campaignService');

async function createCampaign(req, res, next) {
	try {
		const { title, description, category, targetAmount, ngoId, imageUrl } = req.body || {};

		if (!title || !description || !category || !targetAmount) {
			return res.status(400).json({ message: 'Missing required fields.' });
		}

		if (Number(targetAmount) <= 0) {
			return res.status(400).json({ message: 'Target amount must be greater than 0.' });
		}

		const campaign = await campaignService.createCampaign(
			{ title, description, category, targetAmount, ngoId, imageUrl },
			req.session.userId
		);

		return res.status(201).json({ message: 'Campaign created.', campaign });
	} catch (error) {
		next(error);
	}
}

async function listCampaigns(req, res, next) {
	try {
		const { status, category, search, limit = 50, offset = 0 } = req.query;

		const filters = {};
		if (status) filters.status = status;
		if (category) filters.category = category;
		if (search) filters.search = search;

		const campaigns = await campaignService.listCampaigns(filters, Number(limit), Number(offset));
		return res.json({ campaigns, count: campaigns.length });
	} catch (error) {
		next(error);
	}
}

async function getCampaign(req, res, next) {
	try {
		const { id } = req.params;
		const campaign = await campaignService.getCampaignDetail(id);
		return res.json({ campaign });
	} catch (error) {
		next(error);
	}
}

async function updateCampaign(req, res, next) {
	try {
		const { id } = req.params;
		const { title, description, category, targetAmount, status, imageUrl, startDate, endDate } =
			req.body || {};

		const campaign = await campaignService.updateCampaign(
			id,
			{ title, description, category, targetAmount, status, imageUrl, startDate, endDate },
			req.session.userId
		);

		return res.json({ message: 'Campaign updated.', campaign });
	} catch (error) {
		next(error);
	}
}

async function submitForApproval(req, res, next) {
	try {
		const { id } = req.params;
		const campaign = await campaignService.submitForApproval(id, req.session.userId);
		return res.json({ message: 'Campaign submitted for approval.', campaign });
	} catch (error) {
		next(error);
	}
}

async function approveCampaign(req, res, next) {
	try {
		const { id } = req.params;
		const campaign = await campaignService.approveCampaign(id);
		return res.json({ message: 'Campaign approved.', campaign });
	} catch (error) {
		next(error);
	}
}

async function rejectCampaign(req, res, next) {
	try {
		const { id } = req.params;
		const { reason } = req.body || {};
		const campaign = await campaignService.rejectCampaign(id, reason);
		return res.json({ message: 'Campaign rejected.', campaign });
	} catch (error) {
		next(error);
	}
}

async function deleteCampaign(req, res, next) {
	try {
		const { id } = req.params;
		await campaignService.deleteCampaign(id, req.session.userId);
		return res.json({ message: 'Campaign deleted.' });
	} catch (error) {
		next(error);
	}
}

module.exports = {
	createCampaign,
	listCampaigns,
	getCampaign,
	updateCampaign,
	submitForApproval,
	approveCampaign,
	rejectCampaign,
	deleteCampaign
};
