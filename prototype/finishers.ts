import { getModifierPrintName } from "./items.ts";

import type { IngredientUnit } from "./utilities.ts";
import {
	arrayOfIngredientUnitsMatchIncludingQuantity,
	listToTally,
	quickOxfordCommas,
	sortAndStringifyArray
} from "./utilities.ts";

import { getVariantParent } from "./variants.ts";

type ProductFinisherType = 'filling' | 'decoration' | 'doodad';
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

export type FinishedProduct = {
	product: string;
	quantity: number;
	modifiers: string[];
	filling: IngredientUnit[];
	decoration: IngredientUnit[];
	doodad: IngredientUnit[];
};
export const finishedProductMatchIgnoringQuantity = (a: FinishedProduct, b: FinishedProduct): boolean => {
	return a.product === b.product
		&& sortAndStringifyArray(a.modifiers) === sortAndStringifyArray(b.modifiers)
		&& arrayOfIngredientUnitsMatchIncludingQuantity(a.filling, b.filling)
		&& arrayOfIngredientUnitsMatchIncludingQuantity(a.decoration, b.decoration)
		&& arrayOfIngredientUnitsMatchIncludingQuantity(a.doodad, b.doodad)
}

// Returns new Product, or null if the process failed
export const addFinisherToProduct = (finisherType: ProductFinisherType, ingredient: IngredientUnit, product: FinishedProduct): FinishedProduct | null => {
	const ret = structuredClone(product);
	if (!isFinisherAllowedOnProduct(ingredient.item, finisherType, product.product)) {
		return null;
	}
	// Doodads cannot go on a product without a decoration for it to stick to
	if (finisherType === 'doodad' && product.decoration.length === 0) {
		return null;
	}
	ret[finisherType].push(ingredient);
	return ret;
}

// ------------------------------------- AUTO DISPLAY NAMES ------------------------------------- //

const reproductiveNumbers: Record<number, string> = {
	0: '',
	1: '',
	2: 'double ',
	3: 'triple ',
	4: 'quad ',
	5: 'm-m-m-monster ',
};
const getReproductiveNumber = (n: number): string => {
	if (reproductiveNumbers[n] !== undefined) {
		return reproductiveNumbers[n];
	}
	if (n > 5) {
		return reproductiveNumbers[5];
	}
	throw new Error ("UNREACHABLE")
};

// e.g. item: 'frosting', modifiers: ['cocoa_powder', 'cocoa_powder'] -> 'double chocolate frosting'
const printModifiersWithItemName = (item: string, modifiers: string[]): string => {
	const sortedPrettyNames = modifiers.map(getModifierPrintName).sort()
	const tally = listToTally(sortedPrettyNames);
	const prettiedModifiers = Object.entries(tally).map(([modifierName, quantity])=>{
		const prettyNumber = getReproductiveNumber(quantity);
		return prettyNumber + modifierName;
	})
	return [...prettiedModifiers, item.replace(/_/g, ' ')].join(' ');
};

// If there is two+ of a modifier's quantity on a finisher item, don't do the same "double" stuff as above
// Instead add "extra" (because it's not quad choc frosting, it's an extra amount of double choc frosting)
// { item: 'frosting', quantity: 2, modifiers: ['cocoa_powder', 'cocoa_powder' ]} -> extra double chocolate frosting

const prettyPrintFinisherIncludingQuantity = (finisher: IngredientUnit): string => {
	const twoOrMore = finisher.quantity > 1 ? 'extra ' : '';
	const name = printModifiersWithItemName(finisher.item, finisher.modifiers);
	return twoOrMore + name;
};

const printXQuantity = (n: number): string => {
	return n > 1 ? `${n}x ` : '';
}

export const prettyPrintFinishedProduct = (product: FinishedProduct): string => {
	const count = printXQuantity(product.quantity);
	const base = printModifiersWithItemName(product.product, product.modifiers);

	const extras: string[] = [];

	const fillings = product.filling.map(prettyPrintFinisherIncludingQuantity);
	if (fillings.length > 0) {
		extras.push(`with ${quickOxfordCommas(fillings)} filling`);
	}

	const decorations = product.decoration.map(prettyPrintFinisherIncludingQuantity);
	if (decorations.length > 0) {
		extras.push(`with ${quickOxfordCommas(decorations)}`);
	}

	const doodads = product.doodad.map(prettyPrintFinisherIncludingQuantity);
	if (doodads.length > 0) {
		extras.push(`topped with ${quickOxfordCommas(doodads)}`);
	}

	let finishers = extras.join(', ');
	if (finishers !== '') {
		finishers = ' ' + finishers;
	}
	return count + base + finishers;
};

// For things that aren't finished, like things from the store or in inventory, here's a more generic thing:

export const printGenericIngredientUnit = (item: IngredientUnit) => {
	const modifierAndItemName = printModifiersWithItemName(item.item, item.modifiers);
	const nX = printXQuantity(item.quantity);
	return nX + modifierAndItemName;
};

