import axios from 'axios';
import { openai } from '../index.js';

const SHIPPING_TABLE = [
	{
		name: 'RM – Large Letter',
		maxWeight: 0.5,
		maxLength: 35.3,
		maxWidth: 25,
		maxHeight: 2.5,
		price: 2.88,
		carrierCode: 'RoyalMail',
		serviceCode: 'RM_LargeLetter_1st',
	},
	{
		name: 'Evri – Postable',
		maxWeight: 1,
		maxLength: 35,
		maxWidth: 23,
		maxHeight: 3,
		price: 3.24,
		carrierCode: 'Evri',
		serviceCode: 'Evri_Postable',
	},
	{
		name: 'InPost – Small Locker',
		maxWeight: 15,
		maxLength: 64,
		maxWidth: 38,
		maxHeight: 8,
		price: 3.47,
		carrierCode: 'InPost',
		serviceCode: 'InPost_SmallLocker',
	},
	{
		name: 'InPost – Medium Locker',
		maxWeight: 15,
		maxLength: 64,
		maxWidth: 38,
		maxHeight: 19,
		price: 4.79,
		carrierCode: 'InPost',
		serviceCode: 'InPost_MediumLocker',
	},
	{
		name: 'Evri – Small Parcel',
		maxWeight: 2,
		maxSize: 120,
		maxGirth: 245,
		price: 5.75,
		carrierCode: 'Evri',
		serviceCode: 'Evri_SmallParcel',
	},
	{
		name: 'InPost – Large Locker',
		maxWeight: 15,
		maxLength: 64,
		maxWidth: 38,
		maxHeight: 41,
		price: 7.19,
		carrierCode: 'InPost',
		serviceCode: 'InPost_LargeLocker',
	},
	{
		name: 'Evri – Medium Parcel',
		maxWeight: 5,
		maxSize: 120,
		maxGirth: 245,
		price: 7.79,
		carrierCode: 'Evri',
		serviceCode: 'Evri_MediumParcel',
	},
	{
		name: 'Evri – Large Parcel',
		maxWeight: 10,
		maxSize: 120,
		maxGirth: 245,
		price: 7.79,
		carrierCode: 'Evri',
		serviceCode: 'Evri_LargeParcel',
	},
	{
		name: 'Evri – Heavy Parcel',
		maxWeight: 15,
		maxSize: 120,
		maxGirth: 245,
		price: 11.98,
		carrierCode: 'Evri',
		serviceCode: 'Evri_HeavyParcel',
	},
	{
		name: 'Heavy Parcel',
		maxWeight: 20,
		maxLength: 61,
		maxWidth: 46,
		maxHeight: 46,
		price: 14.27,
		carrierCode: 'Other',
		serviceCode: 'HeavyParcel',
	},
	{
		name: 'Very Heavy Parcel',
		maxWeight: 30,
		maxSize: 150,
		maxGirth: 300,
		price: 15.37,
		carrierCode: 'Other',
		serviceCode: 'VeryHeavyParcel',
	},
];

const LLM_PROMPT = `You are an expert in estimating package dimensions and selecting optimal shipping methods.

Based on the product information provided, your task is to:

1. Estimate realistic package weight (kg) and dimensions (L×W×H in cm) INCLUDING packaging material.
2. From the shipping table below, find ALL shipping options where the estimated weight and dimensions fit within the limits.
3. Select the LOWEST-PRICE valid option.
4. Return ONLY a JSON object (no commentary, no markdown) formatted for POST https://api.ebay.com/sell/account/v1/fulfillment_policy

**SHIPPING TABLE:**
${SHIPPING_TABLE.map(
	(s, i) =>
		`${i + 1}. ${s.name}
   - Max Weight: ${s.maxWeight} kg
   - Max Dimensions: ${
			s.maxLength
				? `${s.maxLength}×${s.maxWidth}×${s.maxHeight} cm`
				: `${s.maxSize} cm max, girth ≤ ${s.maxGirth} cm`
		}
   - Price: £${s.price.toFixed(2)}
   - Carrier: ${s.carrierCode}
   - Service Code: ${s.serviceCode}`
).join('\n\n')}

**OUTPUT FORMAT:**
{
  "marketplaceId": "EBAY_GB",
  "name": "TMP-[CARRIER]-[PRICE]-[YYYYMMDD-HHMM]",
  "categoryTypes": [{"name": "ALL_EXCLUDING_MOTORS_VEHICLES"}],
  "handlingTime": {"unit": "DAY", "value": 1},
  "shippingOptions": [{
    "optionType": "DOMESTIC",
    "costType": "FLAT_RATE",
    "shippingServices": [{
      "sortOrder": 1,
      "buyerResponsibleForShipping": true,
      "freeShipping": false,
      "shippingCarrierCode": "[CARRIER_CODE]",
      "shippingServiceCode": "[SERVICE_CODE]",
      "shippingCost": {"currency": "GBP", "value": "[PRICE]"},
      "additionalShippingCost": {"currency": "GBP", "value": "0.00"}
    }]
  }],
  "description": "Temporary policy for [service], weight [x] kg, size [L×W×H] cm, cost £[price].",
  "estimatedWeight": [WEIGHT_IN_KG],
  "estimatedDimensions": {"length": [L], "width": [W], "height": [H]}
}

**RULES:**
- Use current timestamp for policy name in format: TMP-[CARRIER]-[PRICE]-[YYYYMMDD-HHMM]
- Price in name should use underscore for decimal (e.g., 2_88 for £2.88)
- Always choose the cheapest valid option
- Include estimated weight and dimensions in the response for verification
- Return ONLY valid JSON, no additional text`;

export const createDynamicFulfillmentPolicy = async (
	token,
	title,
	description,
	imageUrls
) => {
	try {
		// Step 1: Ask LLM to estimate weight/dimensions and generate policy JSON
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{
					role: 'system',
					content: LLM_PROMPT,
				},
				{
					role: 'user',
					content: `Product Title: ${title}
Product Description: ${description}
${imageUrls ? `Product Images: ${imageUrls.join(', ')}` : ''}

Please estimate the package dimensions and select the optimal shipping method.`,
				},
			],
			temperature: 0.3,
		});

		let policyPayload = completion.choices[0].message?.content ?? '';

		// Clean up response
		policyPayload = policyPayload
			.replace(/^```json\s*/g, '')
			.replace(/\s*```$/g, '')
			.trim();

		console.log('Generated Policy Payload:', policyPayload);

		const parsedPolicy = JSON.parse(policyPayload);

		// Log estimated dimensions for debugging
		console.log('Estimated Weight:', parsedPolicy.estimatedWeight, 'kg');
		console.log('Estimated Dimensions:', parsedPolicy.estimatedDimensions);

		// Remove estimation fields before sending to eBay
		delete parsedPolicy.estimatedWeight;
		delete parsedPolicy.estimatedDimensions;

		// Step 2: Create the fulfillment policy on eBay
		const { data } = await axios.post(
			'https://api.ebay.com/sell/account/v1/fulfillment_policy',
			parsedPolicy,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			}
		);

		console.log(
			'Created Fulfillment Policy:',
			data.fulfillmentPolicyId,
			data.name
		);

		return data.fulfillmentPolicyId;
	} catch (error) {
		console.error(
			'Error creating dynamic fulfillment policy:',
			error.response?.data || error.message
		);
		
		// Fallback: use default policy if dynamic creation fails
		console.log('Falling back to default fulfillment policy');
		const { fulfillmentPolicyId } = await getDefaultFulfillmentPolicy(token);
		return fulfillmentPolicyId;
	}
};

// Fallback function to get or create a default fulfillment policy
const getDefaultFulfillmentPolicy = async (token) => {
	try {
		const { data } = await axios.get(
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

		if (data.total > 0) {
			return { fulfillmentPolicyId: data.fulfillmentPolicies[0].fulfillmentPolicyId };
		}

		// Create default policy if none exists
		const { data: newPolicy } = await axios.post(
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

		return { fulfillmentPolicyId: newPolicy.fulfillmentPolicyId };
	} catch (error) {
		console.error('Error getting default policy:', error.response?.data || error.message);
		throw error;
	}
};