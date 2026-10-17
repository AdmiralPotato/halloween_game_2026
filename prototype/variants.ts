type VariantInfo = {
	parent: string;
	variantName: string;
};

const variantLookup: Record<string, VariantInfo> = {
	cherry_flavoring: { parent: 'flavoring', variantName: 'cherry' },
	strawberry_flavoring: { parent: 'flavoring', variantName: 'strawberry' },
	raspberry_flavoring: { parent: 'flavoring', variantName: 'raspberry' },
	orange_flavoring: { parent: 'flavoring', variantName: 'orange' },
	almond_flavoring: { parent: 'flavoring', variantName: 'almond' },
	lemon_flavoring: { parent: 'flavoring', variantName: 'lemon' },
	lime_flavoring: { parent: 'flavoring', variantName: 'lime' },
	blueberry_flavoring: { parent: 'flavoring', variantName: 'blueberry' },
	ube_flavoring: { parent: 'flavoring', variantName: 'ube' },
	mint_flavoring: { parent: 'flavoring', variantName: 'mint' },
	caramel_flavoring: { parent: 'flavoring', variantName: 'caramel' },
	red_candied_flowers: { parent: 'candied_flowers', variantName: 'red' },
	white_candied_flowers: { parent: 'candied_flowers', variantName: 'white' },
	blue_candied_flowers: { parent: 'candied_flowers', variantName: 'blue' },
	yellow_candied_flowers: { parent: 'candied_flowers', variantName: 'yellow' },
	rainbow_sprinkles: { parent: 'sprinkles', variantName: 'rainbow' },
	chocolate_sprinkles: { parent: 'sprinkles', variantName: 'chocolate' },
	white_sprinkles: { parent: 'sprinkles', variantName: 'white' },
	ball_bearing_sprinkles: { parent: 'sprinkles', variantName: 'ball_bearing' },
	hard_candy_bats: { parent: 'hard_candy_shapes', variantName: 'bat' },
	hard_candy_eyeballs: { parent: 'hard_candy_shapes', variantName: 'eyeball' },
	hard_candy_ghosts: { parent: 'hard_candy_shapes', variantName: 'ghost' },
};

export const getVariantParent = (v: string) => {
	const info = variantLookup[v];
	if (info === undefined) {
		return undefined;
	}
	return info.parent;
};

export const getVariantPrintName = (v: string) => {
	const info = variantLookup[v];
	if (info === undefined) {
		return undefined;
	}
	return info.variantName;
}
