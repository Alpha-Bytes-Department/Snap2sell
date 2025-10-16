export const demoData = /*javascript*/ `{
	inventory: {
		availability: {
			shipToLocationAvailability: {
				quantity: 1, // Always 1
			},
		},
		condition: 'USED_EXCELLENT', // Valid: NEW, NEW_OTHER, NEW_WITH_DEFECTS, CERTIFIED_REFURBISHED, EXCELLENT_REFURBISHED, VERY_GOOD_REFURBISHED, GOOD_REFURBISHED, SELLER_REFURBISHED, LIKE_NEW, USED_EXCELLENT, USED_VERY_GOOD, USED_GOOD, USED_ACCEPTABLE, PRE_OWNED_EXCELLENT, PRE_OWNED_FAIR, FOR_PARTS_OR_NOT_WORKING
		conditionDescription: '', // Custom condition note - describe wear, defects, etc. (Max: 1000 characters). Only for USED/REFURBISHED items, NOT for NEW conditions. eBay will ignore this field if used with NEW conditions.
		product: {
			title: '', // Create an SEO-friendly title (max 80 characters) including the brand, model, key specifications (e.g., size, color), and condition if used. Use UK English.
			description: '', // Produce detailed, professional descriptions tailored to the item's category and features. Plain-text description (no HTML) including item features, condition details, what's included, functionality, and positive/negative aspects.
			aspects: {
				// Brand: ['GoPro'],
				// Type: ['Helmet/Action'],
				// 'Storage Type': ['Removable'],
				// 'Recording Definition': ['High Definition'],
				// 'Media Format': ['Flash Drive (SSD)'],
				// 'Optical Zoom': ['10x'],
				// Add more aspects
			},
			brand: '', // Product brand
			mpn: '', // Manufacturer part number
		},
	},
	offer: {
		format: 'FIXED_PRICE', // Valid eBay offer format, e.g., FIXED_PRICE
		availableQuantity: 1, // Available quantity, type: Number
		categoryId: '', // Valid eBay Category ID
		listingDescription: '', // Detailed product listing description to attract buyers
		pricingSummary: {
			price: {
				currency: 'GBP',
				value: '00.00',
			},
		},
		quantityLimitPerBuyer: 1, // Quantity limit per buyer, adjusted based on product category
		includeCatalogProductDetails: true,
		shipToLocations: {
			regionIncluded: [
				{
					regionType: 'COUNTRY',
					regionName: 'GB', // UK shipping
				},
			],
		},
		shipping: {
			shippingOptions: [
				{
					shippingServiceCode: 'UK_RoyalMailFirstClassStandard', // Exact valid code for Royal Mail 1st Class
					shippingCost: {
						currency: 'GBP',
						value: '3.99', // Flat-rate example for lightweight items (<100g)
					},
					shippingCarrierCode: 'RoyalMail', // Exact carrier code
					shipToLocations: {
						regionIncluded: [
							{
								regionType: 'COUNTRY',
								regionName: 'GB',
							},
						],
					},
					estimatedDeliveryTime: {
						minDays: 1,
						maxDays: 2, // Typical for 1st Class
					},
					freeShipping: false, // Set to true if offering free shipping
				},
				{
					shippingServiceCode: 'UK_RoyalMailStandard', // Exact valid code for Royal Mail 2nd Class
					shippingCost: {
						currency: 'GBP',
						value: '2.99', // Flat-rate example for lightweight items (<100g)
					},
					shippingCarrierCode: 'RoyalMail',
					shipToLocations: {
						regionIncluded: [
							{
								regionType: 'COUNTRY',
								regionName: 'GB',
							},
						],
					},
					estimatedDeliveryTime: {
						minDays: 2,
						maxDays: 3, // Typical for 2nd Class
					},
					freeShipping: false,
				},
			],
			shippingCostType: 'FLAT_RATE', // Options: FLAT_RATE, CALCULATED
			handlingTime: {
				value: 1, // Handling time in days
				unit: 'DAY',
			},
		},
	},
}`;
