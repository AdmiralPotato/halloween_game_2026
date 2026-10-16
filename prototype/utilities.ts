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

