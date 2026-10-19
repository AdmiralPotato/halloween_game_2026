import type {
	Product,
	Ingredient
} from "./utilities.ts";
import {
	listToTally,
	tallyToList
} from "./utilities.ts";

import type { AttributeMap, AttributeSpread } from "./attributes.ts";
import {
	addAttributesToMap,
	addAttributesToSpread,
	maillardAttributes
} from "./attributes.ts";

import { getItemInfo } from "./items.ts";

import { getVariantParent } from "./variants.ts";

export type RecipeInfo = {
	output: string;
	quantity: number;
	location: string; // the appliance or tool to use
	pan?: string; // what kind of pan to use
	time: number; // not exact time, but "short"/"medium"/"long" tiers
	// attributes to add to the output (in addition to those of the ingredients):
	newAttributes: AttributeMap,
	// these will also add their attributes to the output:
	ingredients: string[],
	allowedModifiers: string[];
}

const recipeList: RecipeInfo[] = [
	{
		output: 'chocolate_chips',
		quantity: 4,
		location: 'cutting_board',
		time: 1,
		ingredients: [ 'chocolate_bar' ],
		newAttributes: {
			pop: 1
		},
		allowedModifiers: [],
	},
	{
		output: 'frosting',
		quantity: 2,
		location: 'mixer',
		time: 2,
		ingredients: [ 'sugar' ],
		newAttributes: {
			pale: 3,
			soft: 1,
		},
		allowedModifiers: [
			'cocoa_powder',
			'flavoring',
		],
	},
	{
		output: 'whipped_cream',
		quantity: 3,
		location: 'mixer',
		time: 3,
		ingredients: [ 'cream' ],
		newAttributes: {
			pale: 1,
			soft: 3,
		},
		allowedModifiers: [],
	},
	{
		output: 'pastry_cream',
		quantity: 1,
		location: 'saucepan',
		time: 2,
		ingredients: [ 'cream', 'egg' ],
		newAttributes: {
			pale: -1,
			soft: 1
		},
		allowedModifiers: [],
	},
	{
		output: 'pudding',
		quantity: 1,
		location: 'saucepan',
		time: 2,
		ingredients: [ 'cream', 'sugar' ],
		newAttributes: {
			soft: 2
		},
		allowedModifiers: [
			'cocoa_powder',
			'flavoring',
		],
	},
	// PRE-BAKING OUTPUT
	{
		output: 'cookie_dough',
		quantity: 1,
		location: 'mixer',
		time: 2,
		ingredients: [ 'flour', 'sugar' ],
		newAttributes: {
			soft: 1,
		},
		allowedModifiers: [
			'cocoa_powder',
			'flavoring',
			'chocolate_chips',
		],
	},
	{
		// Duplicate! (so you can add modifiers to already-finished cookie dough)
		output: 'cookie_dough',
		quantity: 1,
		location: 'mixer',
		time: 0, // Note the cook time!
		ingredients: [ 'cookie_dough' ],
		newAttributes: {}, // No "new" attributes because that part happened already
		allowedModifiers: [
			'cocoa_powder',
			'flavoring',
			'chocolate_chips',
		],
	},
	{
		output: 'cake_batter',
		quantity: 1,
		location: 'mixer',
		time: 2,
		ingredients: [ 'flour', 'sugar', 'egg' ],
		newAttributes: {
			soft: 1,
		},
		allowedModifiers: [
			'cocoa_powder',
			'flavoring',
			'chocolate_chips',
			'shredded_carrot',
		],
	},
	{
		// Duplicate! (so you can add modifiers to already-finished batter)
		output: 'cake_batter',
		quantity: 1,
		location: 'mixer',
		time: 0, // Note the cook time!
		ingredients: [ 'cake_batter' ],
		newAttributes: {}, // No "new" attributes because that part happened already
		allowedModifiers: [
			'cocoa_powder',
			'flavoring',
			'chocolate_chips',
			'shredded_carrot',
			'sprinkles',
		],
	},
	// POST-BAKING OUTPUT! THE ACTUAL PRODUCTS
	// Note: cooking adds "dark: 1" automatically
	{
		output: 'cookie',
		quantity: 1,
		location: 'oven',
		pan: 'cookie_sheet',
		time: 2,
		ingredients: [ 'cookie_dough' ],
		newAttributes: {},
		allowedModifiers: [],
	},
	{
		output: 'cupcake',
		quantity: 1,
		location: 'oven',
		pan: 'muffin_tin',
		time: 3,
		ingredients: [ 'cake_batter' ],
		newAttributes: {},
		allowedModifiers: [ 'muffin_liners' ],
	},
	{
		output: 'cake',
		quantity: 1,
		location: 'oven',
		pan: 'cake_pan',
		time: 4,
		ingredients: [ 'cake_batter' ],
		newAttributes: {},
		allowedModifiers: [ 'cake_form' ],
	},
	{
		output: 'cake_slice',
		quantity: 1,
		location: 'cake_knife',
		time: 0,
		ingredients: [ 'cake' ],
		newAttributes: {},
		allowedModifiers: [],
	}
];

export const getRecipesForOutput = (product: string) => {
	const recipes = Object.values(recipeList).filter(v=>v.output === product);
	if (recipes.length === 0) {
		throw new Error (`No recipes found for product ${product}`);
	}
	return recipes;
};

export const getFirstRecipeForOutput = (product: string) => {
	const recipes = getRecipesForOutput(product);
	return recipes[0];
};

export const getRecipesForLocation = (location: string) => {
	const recipes = Object.values(recipeList).filter(v=>v.location === location);
	if (recipes.length === 0) {
		throw new Error (`No recipes found for location ${location}`);
	}
	return recipes;
};

export const isModifierAllowedInRecipe = (modifier: string, recipe: RecipeInfo): boolean => {
	if (recipe.allowedModifiers.includes(modifier)) {
		return true;
	}
	// If we're here, we might need to look it up by its parent name
	// E.g. cherry_flavoring -> flavoring
	const parent = getVariantParent(modifier);
	if (parent !== undefined) {
		return recipe.allowedModifiers.includes(parent);
	}
	return false;
};

// ----------------------------------------- RECIPE + ATTRIBUTES ----------------------------------------- //

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
	const recipe = getFirstRecipeForOutput(item);
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
	if (recipe.pan !== undefined) {
		const bakingAttributes: AttributeMap = maillardAttributes;
		addAttributesToMap(attributes, bakingAttributes);
	}

	if (modifiers.length === 0) {
		recipeAttributeCache[item] = attributes;
	}
	return attributes;
};

export const getAttributesForFoodComponent = (ingredient: Ingredient): AttributeMap => {
	const ret: AttributeMap = {};
	for (let i = 0; i < ingredient.quantity; i++) {
		addAttributesToMap(ret, getAttributesForItemNameAndModifiers(ingredient.name, ingredient.modifiers));
	}
	return ret;
}
export const getAttributesForFoodComponentList = (arr: Ingredient[]): AttributeMap => {
	const ret: AttributeMap = {};
	arr.forEach(ingredient=>{
		addAttributesToMap(ret, getAttributesForFoodComponent(ingredient))
	})
	return ret;
}

export const getAttributeSpreadForProduct = (product: Product): AttributeSpread => {
	const ret: AttributeSpread = {};
	addAttributesToSpread(ret, getAttributesForItemNameAndModifiers(product.name, product.modifiers));
	addAttributesToSpread(ret, getAttributesForFoodComponentList(product.fillings));
	addAttributesToSpread(ret, getAttributesForFoodComponentList(product.decorations));
	addAttributesToSpread(ret, getAttributesForFoodComponentList(product.doodads));
	return ret;
}

// ----------------------------------------- CHECK IF RECIPE SATISFIED ----------------------------------------- //

export type CookingInput = {
	location: string;
	pan?: string;
	ingredients: Ingredient[];
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
	extraneousIngredients: Ingredient[];
	panSatisfied: boolean;
};

const getIngredientRecipeEval = (recipeInfo: RecipeInfo, givenIngredients: (Ingredient|Product)[], pan?: string): CookingCompatibilityEval => {
	const tally = listToTally(recipeInfo.ingredients);
	const inheritedModifiers: string[] = [];
	const newModifiers: string[] = [];
	const extraneousIngredients: Ingredient[] = [];
	givenIngredients.forEach(v=>{
		// v = { item: 'sugar', quantity: 1, modifiers: [] }
		if (tally[v.name]) { // 0 means we don't have any even though there's an entry; the falsiness is fine
			tally[v.name] -= 1;
			if (v.modifiers.length > 0) {
				inheritedModifiers.push(...(v.modifiers))
			}
			return;
		}
		// if allowed as a modifier, collect it
		if (isModifierAllowedInRecipe(v.name, recipeInfo)) {
			for (let i = 0; i < v.quantity; i++) {
				newModifiers.push(v.name);
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
		errorCount: missingIngredients.length + extraneousIngredients.length + Number(pan !== recipeInfo.pan),
		missingIngredients,
		extraneousIngredients,
		panSatisfied: pan === recipeInfo.pan,
	};
};

export const cookEval = (location: string, providedIngredients: (Ingredient|Product)[], pan?: string): CookingCompatibilityEval => {
	// Recipes at the given location
	const allRecipes = getRecipesForLocation(location);
	const evals = allRecipes
		.map(recipe=>getIngredientRecipeEval(recipe, providedIngredients, pan))
		.sort((a,b)=>a.errorCount - b.errorCount)
	const bestScore = evals[0].errorCount
	const bestEvals = evals.filter(v=>v.errorCount === bestScore);
	return bestEvals[0];
};

// ----------------------------------------- DO RECIPE ----------------------------------------- //

export const turnCookEvalIntoOutput = (eva: CookingCompatibilityEval): Product | Ingredient => {
	const info = getItemInfo(eva.output);
	if (!info.categories.includes('product')) {
		const ret: Ingredient = {
			name: eva.output,
			quantity: eva.quantity,
			modifiers: [...eva.inheritedModifiers, ...eva.newModifiers],
		}
		return ret;
	}
	return {
		name: eva.output,
		quantity: eva.quantity,
		modifiers: [...eva.newModifiers, ...eva.inheritedModifiers],
		fillings: [],
		decorations: [],
		doodads: [],
	}
}

export const cook = (location: string, providedIngredients: Ingredient[]): Product | Ingredient => {
	const result = cookEval(location, providedIngredients);
	return {
		name: result.output,
		quantity: result.quantity,
		modifiers: [...result.newModifiers, ...result.inheritedModifiers],
		fillings: [],
		decorations: [],
		doodads: [],
	}
};
