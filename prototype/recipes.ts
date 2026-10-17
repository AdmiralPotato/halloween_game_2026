import type { AttributeMap } from "./attributes.ts";
import { getVariantParent } from "./variants.ts";

export type RecipeInfo = {
	output: string;
	quantity: number;
	location: string; // the appliance or tool to use
	bakeWith?: string; // what kind of pan to use
	time: number; // not exact time, but "short"/"medium"/"long" tiers
	// attributes to add to the output (in addition to those of the ingredients):
	newAttributes: AttributeMap,
	// these will also add their attributes to the output:
	ingredients: string[],
	allowedModifiers: string[];
}

export type Pan = 'cookie_sheet' | 'muffin_tin' | 'cake_pan';
const isPan = (v: unknown): v is Pan => {
	if (v === 'cookie_sheet') { return true; }
	if (v === 'muffin_tin') { return true; }
	if (v === 'cake_pan') { return true; }
	return false;
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
		],
	},
	// POST-BAKING OUTPUT! THE ACTUAL PRODUCTS
	// Note: cooking adds "dark: 1" automatically
	{
		output: 'cookie',
		quantity: 12,
		location: 'oven',
		bakeWith: 'cookie_sheet',
		time: 2,
		ingredients: [ 'cookie_dough' ],
		newAttributes: {},
		allowedModifiers: [ 'cookie_cutter' ],
	},
	{
		output: 'cupcake',
		quantity: 6,
		location: 'oven',
		bakeWith: 'muffin_tin',
		time: 3,
		ingredients: [ 'cake_batter' ],
		newAttributes: {},
		allowedModifiers: [ 'muffin_liner' ],
	},
	{
		output: 'cake',
		quantity: 1,
		location: 'oven',
		bakeWith: 'cake_pan',
		time: 4,
		ingredients: [ 'cake_batter' ],
		newAttributes: {},
		allowedModifiers: ['cake_form'],
	},
	{
		output: 'cake_slice',
		quantity: 6,
		location: 'cake_knife',
		time: 0,
		ingredients: [ 'cake' ],
		newAttributes: {},
		allowedModifiers: [],
	}
];

export const getRecipesForProduct = (product: string) => {
	const recipes = Object.values(recipeList).filter(v=>v.output === product);
	if (recipes.length === 0) {
		throw new Error (`No recipes found for product ${product}`);
	}
	return recipes;
};

export const getFirstRecipeForProduct = (product: string) => {
	const recipes = getRecipesForProduct(product);
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
