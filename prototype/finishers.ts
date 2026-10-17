import { addItemToItemList } from "./simulation.ts";

import type { FinishedProduct, IngredientUnit } from "./utilities.ts";

import { getVariantParent } from "./variants.ts";

export type ProductFinisherType = 'filling' | 'decoration' | 'doodad';
const isProductFinisherType = (v: unknown): v is ProductFinisherType => {
	if (v === 'filling') { return true; }
	if (v === 'decoration') { return true; }
	if (v === 'doodad') { return true; }
	return true;
};

type ProductFinisherInfo = {
	filling: string[];
	decoration: string[];
	doodad: string[];
};

const productFinisherMap: Record<string, ProductFinisherInfo> = {
	cookie: {
		filling: [],
		decoration: [
			'frosting',
		],
		doodad: [
			'candy_shapes',
			'sprinkles',
			'candied_flowers',
		],
	},
	cupcake: {
		filling: [
			'pastry_cream',
			'whipped_cream',
			'pudding',
		],
		decoration: [
			'frosting',
			'whipped_cream',
		],
		doodad: [
			'candy_shapes',
			'sprinkles',
			'candied_flowers',
		],
	},
	cake: {
		filling: [
			'whipped_cream',
			'ice_cream',
		],
		decoration: [
			'frosting',
			'whipped_cream',
		],
		doodad: [
			'sprinkles',
			'candied_flowers',
		],
	},
	cake_slice: {
		filling: [],
		decoration: [],
		doodad: [],
	},
};

const getFinisherInfo = (product: string) => {
	const ret = productFinisherMap[product];
	if (ret === undefined) {
		throw new Error (`No finisher info found for product ${product}`)
	}
	return ret;
};

// We need to do it this way because whipped cream (or other things) could be a filling OR a decoration
export const isFinisherAllowedOnProduct = (finisherName: string, finisherType: ProductFinisherType, product: string): boolean => {
	const finishers = getFinisherInfo(product);
	if (finishers[finisherType].includes(finisherName)) {
		return true;
	}
	// If we're here, we might need to look it up by its parent name
	// E.g. cherry_flavoring -> flavoring
	const parentName = getVariantParent(finisherName);
	if (parentName !== undefined) {
		return finishers[finisherType].includes(parentName);
	}
	return false;
};


const batchSizes: Record<string, number> = {
	cookie: 12,
	cupcake: 6,
	cake: 1,
};

// Returns new Product, or null if the process failed
export const addFinisherToProduct = (finisherType: ProductFinisherType, ingredient: IngredientUnit, product: FinishedProduct): FinishedProduct | null => {
	if (!isFinisherAllowedOnProduct(ingredient.item, finisherType, product.product)) {
		return null;
	}
	// Doodads cannot go on a product without a decoration for it to stick to
	if (finisherType === 'doodad' && product.decoration.length === 0) {
		return null;
	}
	// 1x finisher goes to 1x batch of product. If there is not enough finisher available, it fails.
	const batchSize = batchSizes[product.product];
	const batchMult = product.quantity / batchSize;
	if (ingredient.quantity < batchMult) {
		return null;
	}
	const ret = structuredClone(product);
	const toInsert = {...ingredient, quantity: batchMult}
	addItemToItemList(toInsert, ret[finisherType]);
	ingredient.quantity -= batchMult; // todo: I DON'T LIKE THAT THIS IS HAPPENING
	return ret;
}
