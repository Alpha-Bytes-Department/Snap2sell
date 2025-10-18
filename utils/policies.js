import axios from 'axios';

export const getPolicies = async (token) => {
	const data = {
		fulfillmentPolicyId: '',
		paymentPolicyId: '',
		returnPolicyId: '',
	};

	// Get fulfillment policies
	{
		const {
			data: { total, fulfillmentPolicies },
		} = await axios.get(
			'https://api.ebay.com/sell/account/v1/fulfillment_policy',
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
				params: {
					marketplace_id: 'EBAY_GB',
				},
			}
		);

		if (total) {
			data.fulfillmentPolicyId = fulfillmentPolicies[0].fulfillmentPolicyId;
		} else {
			const {
				data: { fulfillmentPolicyId },
			} = await axios.post(
				'https://api.ebay.com/sell/account/v1/fulfillment_policy',
				{
					name: 'UK_Default_Policy',
					marketplaceId: 'EBAY_GB',
					categoryTypes: [{ name: 'ALL_EXCLUDING_MOTORS_VEHICLES' }],
					handlingTime: { unit: 'DAY', value: '2' },
					shippingOptions: [
						{
							costType: 'FLAT_RATE',
							optionType: 'DOMESTIC',
							shippingServices: [
								{
									shippingCarrierCode: 'RoyalMail',
									shippingServiceCode: 'UK_RoyalMailFirstClassStandard',
									freeShipping: true,
								},
							],
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

			data.fulfillmentPolicyId = fulfillmentPolicyId;
		}
	}

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
							name: 'MOTORS_VEHICLES',
						},
					],
					immediatePay: false,
					fullPaymentDueIn: {
						value: 7,
						unit: 'DAY',
					},
					deposit: {
						amount: {
							value: '500.00',
							currency: 'USD',
						},
						dueIn: {
							value: 48,
							unit: 'HOUR',
						},
					},
					paymentMethods: [
						{
							paymentMethodType: 'CASH_ON_PICKUP',
						},
						{
							paymentMethodType: 'MONEY_ORDER',
						},
						{
							paymentMethodType: 'CASHIER_CHECK',
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

	// get return policies
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
