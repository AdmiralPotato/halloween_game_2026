import type { Product, Ingredient } from "./utilities.ts";
import { addItemToList } from "./utilities.ts";

import { getVariantParent } from "./variants.ts";

export type ProductFinisherType = 'fillings' | 'decorations' | 'doodads';
const isProductFinisherType = (v: unknown): v is ProductFinisherType => {
	if (v === 'fillings') { return true; }
	if (v === 'decorations') { return true; }
	if (v === 'doodads') { return true; }
	return true;
};

type ProductFinisherInfo = {
	sellBatchSize: number;
	fillings: string[];
	decorations: string[];
	doodads: string[];
};

const productFinisherMap: Record<string, ProductFinisherInfo> = {
	cookie: {
		sellBatchSize: 12,
		fillings: [],
		decorations: [
			'frosting',
		],
		doodads: [
			'candy_shapes',
			'sprinkles',
			'candied_flowers',
		],
	},
	cupcake: {
		sellBatchSize: 6,
		fillings: [
			'pastry_cream',
			'whipped_cream',
			'pudding',
		],
		decorations: [
			'frosting',
			'whipped_cream',
		],
		doodads: [
			'candy_shapes',
			'sprinkles',
			'candied_flowers',
		],
	},
	cake: {
		sellBatchSize: 1,
		fillings: [
			'whipped_cream',
			'ice_cream',
		],
		decorations: [
			'frosting',
			'whipped_cream',
		],
		doodads: [
			'sprinkles',
			'candied_flowers',
		],
	},
	cake_slice: {
		sellBatchSize: 6,
		fillings: [],
		decorations: [],
		doodads: [],
	},
};

const getFinisherInfo = (product: string) => {
	const ret = productFinisherMap[product];
	if (ret === undefined) {
		throw new Error (`No finisher info found for product ${product}`)
	}
	return ret;
};

export const productSellBatchSize = (name: string) => {
	const info = getFinisherInfo(name);
	return info.sellBatchSize;
}

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

// Returns new Product, or null if the process failed
// You have to specify the finisher type because some things can be used in more than one way (e.g. whipped cream can be filling or decoration)
export const addFinisherToProduct = (finisherType: ProductFinisherType, ingredient: Ingredient, product: Product): Product | null => {
	if (!isFinisherAllowedOnProduct(ingredient.name, finisherType, product.name)) {
		return null;
	}
	// Doodads cannot go on a product without a decoration for it to stick to
	if (finisherType === 'doodads' && product.decorations.length === 0) {
		return null;
	}
	// 1x finisher goes to 1x batch of product. If there is not enough finisher available, it fails.
	if (ingredient.quantity < product.quantity) {
		return null;
	}
	const ret = structuredClone(product);
	addItemToList(ingredient, ret[finisherType]);
	ingredient.quantity -= product.quantity;
	return ret;
}
