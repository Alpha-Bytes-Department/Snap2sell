export const demoData = /*javascript*/ `{
	inventory: {
		availability: {
			shipToLocationAvailability: {
				quantity: 1, // [1] always 1
			},
		},
		condition: '', // [NEW,	USED,...etc] ...
		product: {
			title: ''
			/* Create an SEO-friendly title (max 80 characters) including the
brand, model, key specifications (e.g., size, color), and condition if
used. Use UK English. Accurately detect brands and models from photos
and text */,
			description: ''
			/*Produce detailed, professional descriptions tailored to the item’s
category and features, even with minimal user input. Plain-text
description (no HTML) that includes:
- Item features and specifications.
- Condition details (e.g., wear, defects).
- What’s included (e.g., original packaging, accessories).
- Functionality (e.g., "fully tested and working").
- Positive and negative aspects (e.g., "like new," "small scratch on side").
- Use short paragraphs or bullet points. */,
			aspects: {
			  like this aspects	// Brand: ['GoPro'],
				// Type: ['Helmet/Action'],
				// 'Storage Type': ['Removable'],
				// 'Recording Definition': ['High Definition'],
				// 'Media Format': ['Flash Drive (SSD)'],
				// 'Optical Zoom': ['10x'],
				... // Add more aspects
			},
			brand: '', // Product brand
	  	mpn: '', // Manufacturer part number valid
		},
	},

	offer: {
		format: '', // valid ebay offer format e.g: FIXED_PRICE!
		availableQuantity: typeOf Number, // Available quantity ...
		categoryId: '', // valid ebay Category ID ...
		listingDescription:
			'', // write awesome large Product listing description, so buyer can buy ...
		pricingSummary: {
			price: {
				currency: 'GBP',
				value: '00.00', 
			},
		},
		quantityLimitPerBuyer: typeOf Number, // Quantity limit per buyer change using product category...
		includeCatalogProductDetails: true,
		shipToLocations: {
			regionIncluded: [
				{
					regionType: 'COUNTRY',
					regionName: 'GB', // GB!
				},
			],
		},
	},

	.///..also add postage
}`;
