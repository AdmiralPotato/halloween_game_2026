import { getVariantPrintName } from "./variants.ts";

export const sortAndStringifyArray = (arr: string[]) => `[` + structuredClone(arr.sort()).join(', ') + `]`;

export const capitalizeFirstLetter = (s: string) => {
	const splits = s.split('');
	splits[0] = splits[0].toLocaleUpperCase();
	return splits.join('');
}

export type Tallies = Record<string, number>;
export const tallyToList = (map: Tallies): string[] => {
	const ret: string[] = [];
	Object.entries(map).forEach(([k,v])=>{
		for (let i = 0; i < v; i++) {
			ret.push(k);
		}
	})
	return ret;
};
export const listToTally = (list: string[]): Tallies => {
	const ret: Tallies = {};
	list.forEach(item=>{
		ret[item] = (ret[item] || 0) + 1;
	})
	return ret;
};
export const talliesAreEqual = (a: Tallies, b: Tallies): boolean => {
	const keysA = Object.keys(a);
	const keysB = Object.keys(b);
	if (keysA.length !== keysB.length) {
		return false;
	}
	const uniqueKeys = [...new Set([...keysA, ...keysB])];
	if (keysA.length !== uniqueKeys.length) {
		return false;
	}
	for (let i = 0; i < uniqueKeys.length; i++) {
		const key = uniqueKeys[i];
		if (a[key] !== b[key]) {
			return false;
		}
	}
	return true;
};

// "INGREDIENT UNIT"

export type IngredientUnit = {
	item: string;
	quantity: number;
	modifiers: string[];
};
const isArrayOfStrings = (arr: unknown): arr is string[] => {
	if (!Array.isArray(arr)) { return false; }
	for (let i = 0; i < arr.length; i++) {
		if (typeof arr[i] !== 'string') {
			return false;
		}
	}
	return true;
}
export const isIngredientUnit = (v: unknown): v is IngredientUnit => {
	if (typeof (v as IngredientUnit).item !== 'string') { return false; }
	if (typeof (v as IngredientUnit).quantity !== 'number') { return false; }
	if (!isArrayOfStrings((v as IngredientUnit).modifiers)) { return false; }
	return true;
};
export const ingredientUnitsMatchIgnoringQuantity = (a: IngredientUnit, b: IngredientUnit): boolean => {
	if (a.item !== b.item) {
		return false;
	}
	if (sortAndStringifyArray(a.modifiers) !== sortAndStringifyArray(b.modifiers)) {
		return false;
	}
	return true;
}
export const ingredientUnitsMatchIncludingQuantity = (a: IngredientUnit, b: IngredientUnit): boolean => {
	if (a.item !== b.item) {
		return false;
	}
	if (a.quantity !== b.quantity) {
		return false;
	}
	if (sortAndStringifyArray(a.modifiers) !== sortAndStringifyArray(b.modifiers)) {
		return false;
	}
	return true;
}
export const arrayOfIngredientUnitsMatchIncludingQuantity = (arrA: IngredientUnit[], arrB: IngredientUnit[]): boolean => {
	if (arrA.length !== arrB.length) {
		// get an easy case out of the way
		return false;
	}
	const matchedA: IngredientUnit[] = [];
	const notMatchedA = arrA.slice();
	const matchedB: IngredientUnit[] = [];
	const notMatchedB = arrB.slice();
	for (let aI = 0; aI < notMatchedA.length; aI++) {
		const a = notMatchedA[aI];
		for (let bI = 0; bI < notMatchedB.length; bI++) {
			const b = notMatchedB[bI];
			if (!ingredientUnitsMatchIncludingQuantity(a, b)) {
				continue;
			}
			matchedA.push(a);
			matchedB.push(b);
			notMatchedA.splice(aI, 1);
			notMatchedB.splice(bI, 1);
		}
	}
	return notMatchedA.length === 0 && notMatchedB.length === 0;
}

export const ingredientUnitsToTallies = (ingredients: IngredientUnit[]) => {
	const ret: Tallies = {};
	ingredients.forEach(v=>{
		ret[v.item] = (ret[v.item] || 0) + v.quantity
	})
	return ret;
};

// MISC

export const quickOxfordCommas = (items: string[]) => {
	if (items.length === 2) {
		return items.join(' and ');
	}
	if (items.length > 2) {
		const last = items.pop();
		const secondToLast = items.pop();
		if (!last || !secondToLast) {
			throw new Error ("I just proved they're there TS");
		}
		items.push(secondToLast + ', and ' + last);
	}
	return items.join(', ');
};

// ---------------------------------- EXFILTRATED ITEM STUFF ---------------------------------- //

export type FinishedProduct = {
	product: string;
	quantity: number;
	modifiers: string[];
	filling: IngredientUnit[];
	decoration: IngredientUnit[];
	doodad: IngredientUnit[];
};
export type Item = IngredientUnit | FinishedProduct;
export const getItemName = (item: Item): string => isIngredientUnit(item) ? item.item : item.product;

export const finishedProductMatchIgnoringQuantity = (a: FinishedProduct, b: FinishedProduct): boolean => {
	return a.product === b.product
		&& sortAndStringifyArray(a.modifiers) === sortAndStringifyArray(b.modifiers)
		&& arrayOfIngredientUnitsMatchIncludingQuantity(a.filling, b.filling)
		&& arrayOfIngredientUnitsMatchIncludingQuantity(a.decoration, b.decoration)
		&& arrayOfIngredientUnitsMatchIncludingQuantity(a.doodad, b.doodad)
};

export const itemTypesMatch = (a: Item, b: Item): boolean => isIngredientUnit(a) === isIngredientUnit(b);
export const itemsMatchIgnoringQuantity = (a: Item, b: Item): boolean => {
	if (!itemTypesMatch(a, b)) {
		return false;
	}
	if (isIngredientUnit(a) && isIngredientUnit(b)) {
		return ingredientUnitsMatchIgnoringQuantity(a, b);
	} else if (!isIngredientUnit(a) && !isIngredientUnit(b)) {
		return finishedProductMatchIgnoringQuantity(a, b)
	}
	return false;
}

// ------------------------------------- AUTO DISPLAY NAMES ------------------------------------- //

export const getModifierPrintName = (modifierName: string): string => {
	if (modifierName === 'cocoa_powder') {
		return 'chocolate';
	}
	if (modifierName === 'chocolate_chips') {
		return 'chocolate chip';
	}
	const variantPrintName = getVariantPrintName(modifierName);
	if (variantPrintName) {
		return variantPrintName.replace(/_/g, ' ');
	}
	return modifierName.replace(/_/g, ' ');
};

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

