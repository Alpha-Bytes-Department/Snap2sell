import axios from 'axios';

export const getLocation = async (token) => {
	try {
		const {
			data: { total, locations },
		} = await axios.get('https://api.ebay.com/sell/inventory/v1/location', {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});

		if (total) {
			return locations[0].merchantLocationKey;
		} else {
			const merchantLocationKey = `merchant_${Date.now()}`;

			await axios.post(
				`https://api.ebay.com/sell/inventory/v1/location/${merchantLocationKey}`,
				{
					location: {
						address: {
							city: 'Sample City',
							stateOrProvince: 'SC',
							country: 'GB',
						},
					},
					name: 'Sample Warehouse',
					merchantLocationStatus: 'ENABLED',
					locationTypes: ['WAREHOUSE'],
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			return merchantLocationKey;
		}
	} catch (error) {
		console.error(error);
	}
};
