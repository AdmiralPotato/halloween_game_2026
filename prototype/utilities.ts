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
export const isIngredientUnit = (v: unknown): v is IngredientUnit => {
	if (typeof (v as IngredientUnit).item !== 'string') { return false; }
	if (typeof (v as IngredientUnit).quantity !== 'number') { return false; }
	if (!Array.isArray((v as IngredientUnit).modifiers)) { return false; }
	if (!((v as IngredientUnit).modifiers.every(v=>typeof v === 'string'))) { return false; }
	return true;
};

export const ingredientUnitsToTallies = (ingredients: IngredientUnit[]) => {
	const ret: Tallies = {};
	ingredients.forEach(v=>{
		ret[v.item] = (ret[v.item] || 0) + v.quantity
	})
	return ret;
};
