import type { AttributeMap } from "./attributes.ts";
import { addAttributesToMap } from "./attributes.ts";

import type { RecipeInfo } from "./recipes.ts";
import { getFirstRecipeForProduct, getRecipesForLocation, isModifierAllowedInRecipe } from "./recipes.ts";

import type { IngredientUnit } from "./utilities.ts";
import { listToTally, tallyToList } from "./utilities.ts";

import { getItemInfo } from "./items.ts";

type Modifier = {
	item: string;
	quantity: number;
};
type ProductComponent = {
	item: string;
	modifiers: Modifier[];
	quantity: number;
};
type FinalItem = {
	base: ProductComponent;
	modifiers?: ProductComponent[],
	fillings?: ProductComponent[],
	decorations?: ProductComponent[],
	doodads?: ProductComponent[],
};

// QUICK TEST

const recipeAttributeCache: Record<string, AttributeMap> = {};

// Note: this does not account for any modifiers atm
export const getAttributesForItem = (item: string, modifiers = [] as string[]) => {
	// Use cache, if any
	const cache = recipeAttributeCache[item];
	if (cache !== undefined) {
		return cache;
	}
	
	const itemInfo = getItemInfo(item);

	// Return attributes if provided
	if (typeof itemInfo.attributes !== 'string') {
		recipeAttributeCache[item] = itemInfo.attributes;
		return itemInfo.attributes;
	}

	// Otherwise generate them from the recipe
	const recipe = getFirstRecipeForProduct(item);
	const attributes: AttributeMap = structuredClone(recipe.newAttributes);
	recipe.ingredients.forEach(ingredient=>{
		const ingredientAttributes = getAttributesForItem(ingredient);
		if (ingredientAttributes === undefined) {
			throw new Error (`Could not get ingredient attributes for ${ingredient}`);
		}
		addAttributesToMap(attributes, ingredientAttributes);
	})

	// Get the modifiers separately (will this work?)
	modifiers.forEach(modifier=>{
		addAttributesToMap(attributes, getAttributesForItem(modifier));
	});

	// IMPORTANT NOTE!! Cooking darkens it slightly! Auto add "dark: 1"
	if (recipe.bakeWith !== undefined) {
		const bakingAttributes: AttributeMap = {dark: 1}
		addAttributesToMap(attributes, bakingAttributes);
	}

	recipeAttributeCache[item] = attributes;
	return attributes;
};

// ------------------------------ A SECOND QUICK TEST ------------------------------


export type CookingInput = {
	location: string;
	ingredients: IngredientUnit[];
};
export type CookingCompatibilityEval = {
	// Output info
	output: string;
	quantity: number;
	inheritedModifiers: string[]; // if the base ingredients had modifiers on them, they land here
	newModifiers: string[]; // new ingredients that are adding new modifiers go here
	// Report card
	errorCount: number; // quantity of problematic ingredients, both missing and extraneous
	missingIngredients: string[];
	extraneousIngredients: IngredientUnit[];
};

const getIngredientRecipeEval = (recipeInfo: RecipeInfo, givenIngredients: IngredientUnit[]): CookingCompatibilityEval => {
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
			newModifiers.push(v.item);
			if (v.modifiers.length > 0) {
				newModifiers.push(...(v.modifiers))
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
		errorCount: missingIngredients.length + extraneousIngredients.length,
		missingIngredients,
		extraneousIngredients,
	};
};

export const cook = (location: string, providedIngredients: IngredientUnit[]) => {
	// Recipes at the given location
	const allRecipes = getRecipesForLocation(location);
	const evals = allRecipes
		.map(recipe=>getIngredientRecipeEval(recipe, providedIngredients))
		.sort((a,b)=>a.errorCount - b.errorCount)
	const bestScore = evals[0].errorCount
	const bestEvals = evals.filter(v=>v.errorCount === bestScore);
	return bestEvals[0];
};
