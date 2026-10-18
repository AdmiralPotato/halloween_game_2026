import { getVariantPrintName } from "./variants.ts";

// ----------------------------------------- GENERIC ----------------------------------------- //

export const capitalizeFirstLetter = (s: string) => {
	const splits = s.split('');
	splits[0] = splits[0].toLocaleUpperCase();
	return splits.join('');
};

export const cleanString = (s: string) => s.replace(/_/g, ' ');

export const capitalizeAndClean = (s: string) => capitalizeFirstLetter(cleanString(s));

export const sortAndStringifyArray = (arr: string[]) => `[` + structuredClone(arr.sort()).join(', ') + `]`;

export const isArrayOfStrings = (arr: unknown): arr is string[] => {
	return arrayValuesAreType(arr, (v)=>typeof v === 'string')
};
export const isArrayOfNumbers = (arr: unknown): arr is string[] => {
	return arrayValuesAreType(arr, (v)=>typeof v === 'number')
};

const arrayValuesAreType = <T>(arr: unknown, fn: (v: unknown) => v is T): arr is T[] => {
	if (!Array.isArray(arr)) { return false; }
	for (let i = 0; i < arr.length; i++) {
		const value = arr[i];
		if (!fn(value)) { return false; }
	}
	return true;
};

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

// ----------------------------------------- TALLIES ----------------------------------------- //

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

// ----------------------------------------- PAN ----------------------------------------- //

export type PanType = 'cookie_sheet' | 'muffin_tin' | 'cake_pan';
export const isPanType = (v: unknown): v is PanType => {
	if (v === 'cookie_sheet') { return true; }
	if (v === 'muffin_tin') { return true; }
	if (v === 'cake_pan') { return true; }
	return false;
};

export type Pan = {
	name: PanType;
	// can either be in a stack or carrying something, not both
	quantity: number;
	carrying: Ingredient | Product | null;
};
export const isPan = (givenV: unknown): givenV is Pan => {
	if (typeof givenV !== 'object') { return false; }
	if (givenV === null) { return false; }
	const v = givenV as Pan;
	if (isPanType(v.name)) { return false; }
	if (typeof v.quantity !== 'number') { return false; }
	if (v.carrying === null) { return true; }
	if (isIngredient(v.carrying)) { return true; }
	if (isProduct(v.carrying)) { return true; }
	return false;
};
export const isEmptyPan = (v: unknown): boolean => {
	if (!isPan(v)) { return false; }
	if (v.carrying !== null) { return false; }
	return true;
};
export const isFullPan = (v: unknown): boolean => {
	if (!isPan(v)) { return false; }
	if (v.carrying === null) { return false; }
	return true;
};

const pansMayContainMap: Record<PanType, string[]> = {
	cookie_sheet: [ 'cookie_dough', 'cookie', 'cookies' ],
	muffin_tin: [ 'muffin_liners', 'batter', 'cupcakes', 'muffins' ],
	cake_pan: [ 'cake_form', 'batter', 'cake' ],
}
export const panMayContain = (pan: PanType, itemName: string): boolean => {
	return pansMayContainMap[pan].includes(itemName);
};

// ----------------------------------------- FOOD COMPONENT ----------------------------------------- //

export type Ingredient = {
	name: string;
	quantity: number;
	modifiers: string[];
};
export const isIngredient = (givenV: unknown): givenV is Ingredient => {
	if (typeof givenV !== 'object') { return false; }
	if (givenV === null) { return false; }
	const v = givenV as Ingredient;
	if (typeof v.name !== 'string') { return false; }
	if (typeof v.quantity !== 'number') { return false; }
	if (!isArrayOfStrings(v.modifiers)) { return false; }
	return true;
};

export const ingredientMatchIgnoringQuantity = (a: Ingredient, b: Ingredient): boolean => {
	if (a.name !== b.name) {
		return false;
	}
	if (sortAndStringifyArray(a.modifiers) !== sortAndStringifyArray(b.modifiers)) {
		return false;
	}
	return true;
};
export const ingredientsMatchIncludingQuantity = (a: Ingredient, b: Ingredient): boolean => {
	if (a.name !== b.name) {
		return false;
	}
	if (a.quantity !== b.quantity) {
		return false;
	}
	if (sortAndStringifyArray(a.modifiers) !== sortAndStringifyArray(b.modifiers)) {
		return false;
	}
	return true;
};
export const arrayOfIngredientMatchIncludingQuantity = (arrA: Ingredient[], arrB: Ingredient[]): boolean => {
	if (arrA.length !== arrB.length) {
		// get an easy case out of the way
		return false;
	}
	const matchedA: Ingredient[] = [];
	const notMatchedA = arrA.slice();
	const matchedB: Ingredient[] = [];
	const notMatchedB = arrB.slice();
	for (let aI = 0; aI < notMatchedA.length; aI++) {
		const a = notMatchedA[aI];
		for (let bI = 0; bI < notMatchedB.length; bI++) {
			const b = notMatchedB[bI];
			if (!ingredientsMatchIncludingQuantity(a, b)) {
				continue;
			}
			matchedA.push(a);
			matchedB.push(b);
			notMatchedA.splice(aI, 1);
			notMatchedB.splice(bI, 1);
		}
	}
	return notMatchedA.length === 0 && notMatchedB.length === 0;
};

export const ingredientToTallies = (ingredients: Ingredient[]) => {
	const ret: Tallies = {};
	ingredients.forEach(v=>{
		ret[v.name] = (ret[v.name] || 0) + v.quantity
	})
	return ret;
};

// ---------------------------------- FINISHED PRODUCTS ---------------------------------- //

export type Product = {
	name: string;
	quantity: number;
	modifiers: string[];
	fillings: Ingredient[];
	decorations: Ingredient[];
	doodads: Ingredient[];
};
export const isProduct = (givenV: unknown): givenV is Product => {
	if (typeof givenV !== 'object') { return false; }
	if (givenV === null) { return false; }
	const v = givenV as Product;
	if (typeof v.name !== 'string') { return false; }
	if (typeof v.quantity !== 'number') { return false; }
	if (!isArrayOfStrings(v.modifiers)) { return false; }
	if (!arrayValuesAreType<Ingredient>(v.fillings, isIngredient)) { return false; }
	if (!arrayValuesAreType<Ingredient>(v.decorations, isIngredient)) { return false; }
	if (!arrayValuesAreType<Ingredient>(v.doodads, isIngredient)) { return false; }
	return true;
};

export const productsMatchIgnoringQuantity = (a: Product, b: Product): boolean => {
	return a.name === b.name
		&& sortAndStringifyArray(a.modifiers) === sortAndStringifyArray(b.modifiers)
		&& arrayOfIngredientMatchIncludingQuantity(a.fillings, b.fillings)
		&& arrayOfIngredientMatchIncludingQuantity(a.decorations, b.decorations)
		&& arrayOfIngredientMatchIncludingQuantity(a.doodads, b.doodads)
};

// --------------------------- ITEM (pan | ingredient | product) --------------------------- //

export type Item = Pan | Ingredient | Product;

export const itemTypesMatch = (a: Item, b: Item): boolean => {
	if (isIngredient(a) === isIngredient(b)) return true;
	if (isProduct(a) === isProduct(b)) return true;
	if (isPan(a) === isPan(b)) return true;
	return false;
};
export const itemsMatchIgnoringQuantity = (a: Item, b: Item): boolean => {
	if (a.name !== b.name) { return false;}
	if (!itemTypesMatch(a, b)) { return false; }
	if (isIngredient(a) && isIngredient(b)) {
		return ingredientMatchIgnoringQuantity(a, b);
	} else if (isProduct(a) && isProduct(b)) {
		return productsMatchIgnoringQuantity(a, b)
	} else if (isPan(a) && isPan(b)) {
		if (a.carrying === null && b.carrying === null) {
			return true;
		} else if (a.carrying !== null && b.carrying !== null) {
			return (itemsMatchIgnoringQuantity(a.carrying, b.carrying));
		}
	}
	return false;
};

export const itemsCanStack = (a: Item, b: Item): boolean => {
	if (isPan(a) && isPan(b)) {
		if (a.carrying !== null || b.carrying !== null) {
			// overrides the below thing
			return false;
		}
	}
	return itemsMatchIgnoringQuantity(a, b);
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
export const printModifiersWithItemName = (item: string, modifiers: string[]): string => {
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

const printFinisherIncludingQuantity = (finisher: Ingredient): string => {
	const twoOrMore = finisher.quantity > 1 ? 'extra ' : '';
	const name = printModifiersWithItemName(finisher.name, finisher.modifiers);
	return twoOrMore + name;
};

const printXQuantity = (n: number): string => {
	return n > 1 ? `${n}x ` : '';
}

export const printFinishedProduct = (product: Product): string => {
	const count = printXQuantity(product.quantity);
	const base = printModifiersWithItemName(product.name, product.modifiers);

	const extras: string[] = [];

	const fillings = product.fillings.map(printFinisherIncludingQuantity);
	if (fillings.length > 0) {
		extras.push(`with ${quickOxfordCommas(fillings)} filling`);
	}

	const decorations = product.decorations.map(printFinisherIncludingQuantity);
	if (decorations.length > 0) {
		extras.push(`with ${quickOxfordCommas(decorations)}`);
	}

	const doodads = product.doodads.map(printFinisherIncludingQuantity);
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

export const printFoodComponent = (item: Ingredient) => {
	const modifierAndItemName = printModifiersWithItemName(item.name, item.modifiers);
	const nX = printXQuantity(item.quantity);
	return nX + modifierAndItemName;
};

// And pans I guess

export const printPan = (item: Pan): string => {
	const pan = cleanString(item.name);
	if (item.carrying === null) {
		return pan;
	}
	const carrying = printItem(item.carrying);
	if (item.name === 'muffin_tin') {
		return `${carrying} in a ${pan}`;
	} else {
		return `${carrying} on a ${pan}`;
	}
};

// Combo

export const printItem = (item: Item): string => {
	if (isIngredient(item)) {
		return printFoodComponent(item)
	} else if (isProduct(item)) {
		return printFinishedProduct(item);
	} else {
		return printPan(item);
	}
}

