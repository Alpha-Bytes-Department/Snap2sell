import axios from 'axios';
import multer from 'multer';
import { getLocation } from '../utils/location.js';
import { getPolicies } from '../utils/policies.js';
import { demoData } from './demo.js';
import { openai } from '../index.js';

const upload = multer({ storage: multer.memoryStorage() });

export const post = (app) => {
	app.post('/ai', upload.array('images'), async (req, res) => {
		const files = req.files;

		if (!files?.length) {
			return res.status(400).json({ error: 'No files uploaded' });
		}

		// Convert each image buffer → base64
		const imageContents = files.map((file) => {
			console.log(file.mimetype);
			return {
				type: 'image_url',
				image_url: {
					url: `data:${
						file.mimetype === 'application/octet-stream'
							? 'image/png'
							: file.mimetype
					};base64,${file.buffer.toString('base64')}`,
				},
			};
		});

		// Ask GPT for a **single combined description**
		const response = await openai.chat.completions.create({
			model: 'gpt-4o', // or "gpt-4o" if you want max detail
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'text',
							text: 'You are a product description expert. Analyze all these uploaded product images together and give me ONE detailed description.',
						},
						{
							type: 'text',
							text: `Product description : ${req.body.description}.`,
						},
						...imageContents,
					],
				},
			],
		});

		const imageDescriptions = response.choices[0].message?.content;

		console.log(imageDescriptions);

		const completion = await openai.chat.completions.create({
			model: 'gpt-4',
			messages: [
				{
					role: 'user',
					content: `${demoData} give me exact json data(only json, not text description) for ebay. Product description : ${req.body.description}, image Descriptions: ${imageDescriptions}`,
				},
			],
			max_tokens: 1000,
			temperature: 1,
		});

		let data = completion.choices?.[0]?.message?.content ?? '';

		try {
			data = JSON.parse(
				data
					.replace(/^```json\s*/g, '')
					.replace(/\s*```$/g, '')
					.replace(/\/\/.*$/gm, '')
					.replace(/\/\*[\s\S]*?\*\//gm, '')
			);
		} catch (err) {
			return res
				.status(400)
				.json({ error: 'Please provide a valid description' });
		}

		data.inventory.product.aspects = Object.fromEntries(
			Object.entries(data.inventory.product.aspects).map(([key, value]) => [
				key,
				value[0],
			])
		);

		res.json(data);
	});

	app.post('/post', upload.array('images'), async (req, res) => {
		let { inventory, offer } = JSON.parse(req.body.data);

		inventory.product.aspects = Object.fromEntries(
			Object.entries(inventory.product.aspects).map(([key, value]) => [
				key,
				[value],
			])
		);

		console.log('d0', JSON.stringify(inventory));

		if (!inventory || !offer) {
			return res.status(400).json({ error: 'Invalid data' });
		}

		let imageUrls = [];

		try {
			if (!req.files?.length) {
				return res.status(400).json({ error: 'No images uploaded' });
			}
			for (const { buffer } of req.files) {
				const { data } = await axios.post(
					`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
					new URLSearchParams({ image: buffer.toString('base64') })
				);
				imageUrls.push(data.data.url);
			}
		} catch ({ response, message }) {
			console.error('Upload error:', response?.data || message);
			return res.status(500).json({ error: 'Image upload failed' });
		}

		Object.assign(inventory?.product, { imageUrls });

		const token = req.headers.authorization.split(' ')[1];

		try {
			const sku = `SKU-${Date.now()}`;
			let merchantLocationKey = await getLocation(token);
			const policies = await getPolicies(token);

			inventory.availability.shipToLocationAvailability.merchantLocationKey =
				merchantLocationKey;

			// Create Inventory Item
			await axios.put(
				`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}?marketplaceId=EBAY_GB`,
				inventory,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
						'Content-Language': 'en-GB',
					},
				}
			);

			// create offer
			const {
				data: { offerId },
			} = await axios.post(
				'https://api.ebay.com/sell/inventory/v1/offer?marketplaceId=EBAY_GB',
				{
					...offer,
					listingPolicies: policies,
					merchantLocationKey,
					sku,
					marketplaceId: 'EBAY_GB',
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
						'Content-Language': 'en-US',
					},
				}
			);

			// publish
			const {
				data: { listingId },
			} = await axios.post(
				`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			res.json({
				message: 'Item listed successfully!',
				sku,
				offerId,
				listingId,
			});
		} catch (error) {
			console.error(error.response?.data || error.message);
			res
				.status(error.response?.status || 500)
				.json({ error: error.response?.data || error.message });
		}
	});
};
