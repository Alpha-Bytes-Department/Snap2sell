import axios from 'axios';
import qs from 'qs';

export const auth = (app, config) => {
	app.get('/connect', (_, res) => {
		try {
			const scopes = [
				'https://api.ebay.com/oauth/api_scope',
				'https://api.ebay.com/oauth/api_scope/sell.inventory',
				'https://api.ebay.com/oauth/api_scope/sell.account',
				'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
				'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
			].join(' ');

			const authUrl = `https://auth.ebay.com/oauth2/authorize?client_id=${
				config.client_id
			}&response_type=code&redirect_uri=${
				config.redirect_uri
			}&scope=${encodeURIComponent(scopes)}`;

			res.redirect(authUrl);
		} catch (error) {
			console.error(error);
			res
				.status(error.response?.status || 500)
				.send('❌ Failed to connect eBay.');
		}
	});

	app.get('/callback', async ({ query }, res) => {
		try {
			const { data } = await axios.post(
				'https://api.ebay.com/identity/v1/oauth2/token',
				qs.stringify({
					grant_type: 'authorization_code',
					code: query.code,
					redirect_uri: config.redirect_uri,
				}),
				{
					headers: {
						Authorization: `Basic ${Buffer.from(
							`${config.client_id}:${config.client_secret}`
						).toString('base64')}`,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				}
			);

			res.status(301).redirect(
				`snap2sell://callback#${Buffer.from(
					JSON.stringify({
						access_token: data.access_token,
						refresh_token: data.refresh_token,
					})
				).toString('base64')}`
			);
		} catch (error) {
			console.error(error.response?.data || error);
			res
				.status(error.response?.status || 500)
				.send('❌ Failed to connect eBay.');
		}
	});

	app.get('/refresh-token', async ({ headers }, res) => {
		const token = headers.authorization?.split(' ')[1] ?? '';

		if (!token) {
			return res.status(400).send('❌ Missing refresh token.');
		}

		try {
			const { data } = await axios.post(
				'https://api.ebay.com/identity/v1/oauth2/token',
				qs.stringify({
					grant_type: 'refresh_token',
					refresh_token: token,
				}),
				{
					headers: {
						Authorization: `Basic ${Buffer.from(
							`${config.client_id}:${config.client_secret}`
						).toString('base64')}`,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				}
			);

			res.json({
				access_token: data.access_token,
			});
		} catch (error) {
			console.error(error.response?.data || error);
			res
				.status(error.response?.status || 500)
				.send('❌ Failed to refresh eBay access token.');
		}
	});
};
