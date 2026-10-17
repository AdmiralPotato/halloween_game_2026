import type { AttributeMap, AttributeSpread } from "./attributes.ts";
import { addAttributesToMap, addAttributesToSpread, maillardAttributes } from "./attributes.ts";

import type { RecipeInfo } from "./recipes.ts";
import { getFirstRecipeForProduct, getRecipesForLocation, isModifierAllowedInRecipe } from "./recipes.ts";

import type { IngredientUnit, FinishedProduct } from "./utilities.ts";
import { listToTally, tallyToList } from "./utilities.ts";

import { getItemInfo } from "./items.ts";

// QUICK TEST

const recipeAttributeCache: Record<string, AttributeMap> = {};

export const getAttributesForItemNameAndModifiers = (item: string, modifiers = [] as string[]): AttributeMap => {
	if (modifiers.length === 0) {
		// Use cache for simple cases
		const cache = recipeAttributeCache[item];
		if (cache !== undefined) {
			return cache;
		}
	}
	
	const itemInfo = getItemInfo(item);

	// Return attributes if provided in the item info
	if (typeof itemInfo.attributes !== 'string') {
		if (modifiers.length === 0) {
			recipeAttributeCache[item] = itemInfo.attributes;
		}
		return itemInfo.attributes;
	}

	// Otherwise generate them from the item info's recipe
	const recipe = getFirstRecipeForProduct(item);
	const attributes: AttributeMap = structuredClone(recipe.newAttributes);
	recipe.ingredients.forEach(ingredient=>{
		const ingredientAttributes = getAttributesForItemNameAndModifiers(ingredient);
		if (ingredientAttributes === undefined) {
			throw new Error (`Could not get ingredient attributes for ${ingredient}`);
		}
		addAttributesToMap(attributes, ingredientAttributes);
	})

	// Get the modifiers separately (will this work?)
	modifiers.forEach(modifier=>{
		addAttributesToMap(attributes, getAttributesForItemNameAndModifiers(modifier));
	});

	// IMPORTANT NOTE!! Cooking darkens it slightly! Auto add maillard attributes
	if (recipe.bakeWith !== undefined) {
		const bakingAttributes: AttributeMap = maillardAttributes;
		addAttributesToMap(attributes, bakingAttributes);
	}

	if (modifiers.length === 0) {
		recipeAttributeCache[item] = attributes;
	}
	return attributes;
};

export const getAttributesForIngredientUnit = (ingredient: IngredientUnit): AttributeMap => {
	const ret: AttributeMap = {};
	for (let i = 0; i < ingredient.quantity; i++) {
		addAttributesToMap(ret, getAttributesForItemNameAndModifiers(ingredient.item, ingredient.modifiers));
	}
	return ret;
}
export const getAttributesForIngredientUnitList = (arr: IngredientUnit[]): AttributeMap => {
	const ret: AttributeMap = {};
	arr.forEach(ingredient=>{
		addAttributesToMap(ret, getAttributesForIngredientUnit(ingredient))
	})
	return ret;
}

export const getAttributeSpreadForFinishedProduct = (product: FinishedProduct): AttributeSpread => {
	const ret: AttributeSpread = {};
	addAttributesToSpread(ret, getAttributesForItemNameAndModifiers(product.product, product.modifiers));
	addAttributesToSpread(ret, getAttributesForIngredientUnitList(product.filling));
	addAttributesToSpread(ret, getAttributesForIngredientUnitList(product.decoration));
	addAttributesToSpread(ret, getAttributesForIngredientUnitList(product.doodad));
	return ret;
}

// ------------------------------ A SECOND QUICK TEST ------------------------------


export type CookingInput = {
	location: string;
	bakeWith?: string;
	ingredients: IngredientUnit[];
};
export type CookingCompatibilityEval = {
	// Output info
	output: string;
	quantity: number;
	inheritedModifiers: string[]; // if the base ingredients had modifiers on them, they land here
	newModifiers: string[]; // new ingredients that are adding new modifiers go here
	recipeAttempted: RecipeInfo;
	// Report card
	errorCount: number; // quantity of problematic ingredients, both missing and extraneous
	missingIngredients: string[];
	extraneousIngredients: IngredientUnit[];
	bakeWithSatisfied: boolean;
};

const getIngredientRecipeEval = (recipeInfo: RecipeInfo, givenIngredients: IngredientUnit[], bakeWith?: string): CookingCompatibilityEval => {
	const tally = listToTally(recipeInfo.ingredients);
	const inheritedModifiers: string[] = [];
	const newModifiers: string[] = [];
	const extraneousIngredients: IngredientUnit[] = [];
	givenIngredients.forEach(v=>{
		// v = { item: 'sugar', quantity: 1, modifiers: [] }
		if (tally[v.item]) { // 0 means we don't have any even though there's an entry; the falsiness is fine
			tally[v.item] -= 1;
			if (v.modifiers.length > 0) {
				inheritedModifiers.push(...(v.modifiers))
			}
			return;
		}
		// if allowed as a modifier, collect it
		if (isModifierAllowedInRecipe(v.item, recipeInfo)) {
			for (let i = 0; i < v.quantity; i++) {
				newModifiers.push(v.item);
				if (v.modifiers.length > 0) {
					newModifiers.push(...v.modifiers)
				}
			}
		} else {
			extraneousIngredients.push(v);
		}
	});
	const missingIngredients = tallyToList(tally);
	return {
		output: recipeInfo.output,
		quantity: recipeInfo.quantity,
		inheritedModifiers,
		newModifiers,
		recipeAttempted: recipeInfo,
		errorCount: missingIngredients.length + extraneousIngredients.length + Number(bakeWith !== recipeInfo.bakeWith),
		missingIngredients,
		extraneousIngredients,
		bakeWithSatisfied: bakeWith === recipeInfo.bakeWith,
	};
};

export const cookEval = (location: string, providedIngredients: IngredientUnit[], bakeWith?: string): CookingCompatibilityEval => {
	// Recipes at the given location
	const allRecipes = getRecipesForLocation(location);
	const evals = allRecipes
		.map(recipe=>getIngredientRecipeEval(recipe, providedIngredients, bakeWith))
		.sort((a,b)=>a.errorCount - b.errorCount)
	const bestScore = evals[0].errorCount
	const bestEvals = evals.filter(v=>v.errorCount === bestScore);
	return bestEvals[0];
};

export const turnCookEvalIntoOutput = (eva: CookingCompatibilityEval): FinishedProduct | IngredientUnit => {
	const info = getItemInfo(eva.output);
	if (!info.categories.includes('product')) {
		const ret: IngredientUnit = {
			item: eva.output,
			quantity: eva.quantity,
			modifiers: [...eva.inheritedModifiers, ...eva.newModifiers],
		}
		return ret;
	}
	return {
		product: eva.output,
		quantity: eva.quantity,
		modifiers: [...eva.newModifiers, ...eva.inheritedModifiers],
		filling: [],
		decoration: [],
		doodad: [],
	}
}

export const cook = (location: string, providedIngredients: IngredientUnit[]): FinishedProduct | IngredientUnit => {
	const result = cookEval(location, providedIngredients);
	return {
		product: result.output,
		quantity: result.quantity,
		modifiers: [...result.newModifiers, ...result.inheritedModifiers],
		filling: [],
		decoration: [],
		doodad: [],
	}
};
