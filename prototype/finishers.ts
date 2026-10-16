import { getModifierPrintName } from "./items.ts";
import type { IngredientUnit } from "./utilities.ts";
import { listToTally, quickOxfordCommas } from "./utilities.ts";
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

export const addFinisherToProduct = (finisherType: ProductFinisherType, ingredient: IngredientUnit, product: FinishedProduct): FinishedProduct | null => {
	const ret = structuredClone(product);
	if (!isFinisherAllowedOnProduct(ingredient.item, finisherType, product.product)) {
		return null;
	}
	ret[finisherType].push(ingredient);
	return ret;
}

// ------------------------------------- NAMING ------------------------------------- //

const prettyNumbers: Record<number, string> = {
	0: '',
	1: '',
	2: 'double ',
	3: 'triple ',
	4: 'quad ',
	5: 'm-m-m-monster ',
};
const getReproductiveNumber = (n: number): string => {
	if (prettyNumbers[n] !== undefined) {
		return prettyNumbers[n];
	}
	if (n > 5) {
		return prettyNumbers[5];
	}
	throw new Error ("UNREACHABLE")
};
const prettyItemMaker = (item: string, modifiers: string[]): string => {
	const sortedPrettyNames = modifiers.map(getModifierPrintName).sort()
	const tally = listToTally(sortedPrettyNames);
	const prettiedModifiers = Object.entries(tally).map(([modifierName, quantity])=>{
		const prettyNumber = getReproductiveNumber(quantity);
		return prettyNumber + modifierName;
	})
	return [...prettiedModifiers, item.replace(/_/g, ' ')].join(' ');
};

const prettyPrintFinisher = (finisher: IngredientUnit): string => {
	const twoOrMore = finisher.quantity > 1 ? 'extra ' : '';
	const name = prettyItemMaker(finisher.item, finisher.modifiers);
	return twoOrMore + name;
}

export const prettyFinishedProductNameMaker = (product: FinishedProduct): string => {
	const count = product.quantity > 1 ? `${product.quantity}x ` : '';
	const base = prettyItemMaker(product.product, product.modifiers);

	const extras: string[] = [];

	const fillings = product.filling.map(prettyPrintFinisher);
	if (fillings.length > 0) {
		extras.push(`with ${quickOxfordCommas(fillings)} filling`);
	}

	const decorations = product.decoration.map(prettyPrintFinisher);
	if (decorations.length > 0) {
		extras.push(`with ${quickOxfordCommas(decorations)}`);
	}

	const doodads = product.doodad.map(prettyPrintFinisher);
	if (doodads.length > 0) {
		extras.push(`topped with ${quickOxfordCommas(doodads)}`);
	}

	let finishers = extras.join(', ');
	if (finishers !== '') {
		finishers = ' ' + finishers;
	}
	return count + base + finishers;
}
