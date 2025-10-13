import axios from 'axios';

export const getPolicies = async (token) => {
	const data = {
		paymentPolicyId: '',
		returnPolicyId: '',
	};

	// Get payment policies
	{
		const {
			data: { total, paymentPolicies },
		} = await axios.get('https://api.ebay.com/sell/account/v1/payment_policy', {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			params: {
				marketplace_id: 'EBAY_GB',
			},
		});

		if (total) {
			data.paymentPolicyId = paymentPolicies[0].paymentPolicyId;
		} else {
			const {
				data: { paymentPolicyId },
			} = await axios.post(
				'https://api.ebay.com/sell/account/v1/payment_policy',
				{
					name: 'UK_Payment_Policy',
					description: 'Standard UK payment policy',
					marketplaceId: 'EBAY_GB',
					categoryTypes: [
						{
							name: 'ALL_EXCLUDING_MOTORS_VEHICLES',
						},
					],
					immediatePay: true,
					paymentMethods: [
						{
							paymentMethodType: 'PAYPAL',
						},
						{
							paymentMethodType: 'CREDIT_CARD',
						},
					],
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			data.paymentPolicyId = paymentPolicyId;
		}
	}

	// Get return policies
	{
		const {
			data: { total, returnPolicies },
		} = await axios.get('https://api.ebay.com/sell/account/v1/return_policy', {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			params: {
				marketplace_id: 'EBAY_GB',
			},
		});

		if (total) {
			data.returnPolicyId = returnPolicies[0].returnPolicyId;
		} else {
			const {
				data: { returnPolicyId },
			} = await axios.post(
				'https://api.ebay.com/sell/account/v1/return_policy',
				{
					name: 'UK_Return_Policy',
					marketplaceId: 'EBAY_GB',
					refundMethod: 'MONEY_BACK',
					returnsAccepted: true,
					returnShippingCostPayer: 'SELLER',
					returnPeriod: {
						value: 30,
						unit: 'DAY',
					},
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			data.returnPolicyId = returnPolicyId;
		}
	}

	return data;
};
