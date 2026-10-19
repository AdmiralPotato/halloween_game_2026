import { getItemInfo } from "./items.ts";
import type { Product, Ingredient, Item } from "./utilities.ts";
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

// PROBLEM: These two only work if you know in advance which type of finisher you're putting on. Don't know if that will work
// TODO FILLING: make something like a Pan, but it's a Piping Bag (?) -- no, be more explicit: Filling Injector, but LOOKS like a piping bag

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

// NEW PARADIGM: bare finisher: decoration, doodad; finisher in applicator: FillingInjector<Ingredient>

export const itemIsBareFinisherTypes = (itemName: string): ('decorations'|'doodads')[] => {
	return getItemInfo(itemName).categories.filter(v=>v === 'decorations' || v === 'doodads');
};
export const isItemBareFinisher = (itemName: string): boolean => {
	const bareFinisherTypes = itemIsBareFinisherTypes(itemName);
	return bareFinisherTypes.length > 0;
};
export const itemIsBareFinisherTypeForProduct = (itemName: string, productName: string): 'decorations' | 'doodads' | null => {
	const itemFinisherTypes = itemIsBareFinisherTypes(itemName);
	for (let i = 0; i < itemFinisherTypes.length; i++) {
		const finisherType = itemFinisherTypes[i];
		const isAllowed = isFinisherAllowedOnProduct(itemName, finisherType, productName);
		if (isAllowed) {
			return finisherType;
		}
	}
	return null;
}