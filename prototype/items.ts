type Tallies = Record<string, number>;

const tallyToList = (map: Tallies): string[] => {
	const ret: string[] = [];
	Object.entries(map).forEach(([k,v])=>{
		for (let i = 0; i < v; i++) {
			ret.push(k);
		}
	})
	return ret;
};
const listToTally = (list: string[]): Tallies => {
	const ret: Tallies = {};
	list.forEach(item=>{
		ret[item] = (ret[item] || 0) + 1;
	})
	return ret;
};

const talliesAreEqual = (a: Tallies, b: Tallies): boolean => {
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
}

// -------------------------------- ATTRIBUTES -------------------------------- //

/*

- Each ingredient contributes certain attributes
- Each product "layer" gets the attributes summed, which may cancel some out, e.g. pale + dark
- Layers:
	- Base (includes modifiers)
	- Filling (does not contribute to shop visual appeal)
	- Decoration
	- Doodads

*/

// COLOR

type Color = 'pale' | 'dark' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'varigated';
const colors = new Set([ 'pale', 'dark', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'varigated' ]);
type ColorInfo = {
	attribute: string;
	type: 'color';
	neighbors?: Color[];
	opposite?: Color
};
const isColor = (v: unknown): v is Color => typeof v === 'string' && colors.has(v);
const isColorInfo = (v: unknown): v is ColorInfo => (v as ColorInfo).type === 'color';

// TEXTURE

type Texture = 'dry' | 'moist' | 'soft' | 'hard' | 'sticky' | 'crumbly' | 'pop';
const textures = new Set([ 'dry', 'moist', 'soft', 'hard', 'sticky', 'crumbly', 'pop' ]);
type TextureInfo = {
	attribute: string;
	type: 'texture';
	opposite?: Texture;
};
const isTexture = (v: unknown): v is Texture => typeof v === 'string' && textures.has(v);
const isTextureInfo = (v: unknown): v is TextureInfo => (v as TextureInfo).type === 'texture';

// FLAVOR

type Flavor = 'nutty' | 'savory' | 'chocolatey' | 'fruity' | 'minty' | 'salty' | 'sweet' | 'tart' | 'floral';
const flavors = new Set([ 'nutty', 'savory', 'chocolatey', 'fruity', 'minty', 'salty', 'sweet', 'tart', 'floral' ]);
type FlavorInfo = {
	attribute: string;
	type: 'flavor';
	opposite?: Flavor;
};
const isFlavor = (v: unknown): v is Flavor => typeof v === 'string' && flavors.has(v);
const isFlavorInfo = (v: unknown): v is FlavorInfo => (v as FlavorInfo).type === 'flavor';

// ALL TOGETHER

type Attribute = Color | Texture | Flavor ;
const isAttribute = (v: unknown): v is Attribute => isColor(v) || isTexture(v) || isFlavor(v);
type AttributeInfo = ColorInfo | TextureInfo | FlavorInfo;

type AttributeMap = Partial<Record<Attribute, number>>;
const isAttributeMap = (v: unknown): v is AttributeMap => {
	if (typeof v !== 'object' || v === null) {
		return false;
	}
	const keysAreGood = Object.keys(v).every(v=>isAttribute(v));
	const valuesAreGood = Object.values(v).every(v=>typeof v === 'number');
	return keysAreGood && valuesAreGood;
};

// THE ACTUAL INFO

const attributeInfo: Record<Attribute, AttributeInfo> = {
	pale: {
		type: 'color',
		attribute: 'pale',
		opposite: 'dark',
		neighbors: [ 'blue', 'purple' ],
	},
	dark: {
		type: 'color',
		attribute: 'dark',
		opposite: 'pale',
		neighbors: [ 'yellow', 'orange' ],
	},
	red: {
		type: 'color',
		attribute: 'red',
		neighbors: ['purple', 'orange'],
	},
	orange: {
		type: 'color',
		attribute: 'orange',
		neighbors: ['red', 'yellow', 'pale'],
	},
	yellow: {
		type: 'color',
		attribute: 'yellow',
		neighbors: ['orange', 'green', 'pale'],
	},
	green: {
		type: 'color',
		attribute: 'green',
		neighbors: ['yellow', 'blue'],
	},
	blue: {
		type: 'color',
		attribute: 'blue',
		neighbors: ['green', 'purple', 'dark'],
	},
	purple: {
		type: 'color',
		attribute: 'purple',
		neighbors: ['blue', 'red', 'dark'],
	},
	varigated: {
		type: 'color',
		attribute: 'varigated',
	},
	dry: {
		type: 'texture',
		attribute: 'dry',
		opposite: 'moist',
	},
	moist: {
		type: 'texture',
		attribute: 'moist',
		opposite: 'dry',
	},
	soft: {
		type: 'texture',
		attribute: 'soft',
		opposite: 'hard',
	},
	hard: {
		type: 'texture',
		attribute: 'hard',
		opposite: 'soft',
	},
	sticky: {
		type: 'texture',
		attribute: 'sticky',
		opposite: 'crumbly',
	},
	crumbly: {
		type: 'texture',
		attribute: 'crumbly',
		opposite: 'sticky',
	},
	pop: {
		type: 'texture',
		attribute: 'pop',
	},
	nutty: {
		type: 'flavor',
		attribute: 'nutty',
	},
	savory: {
		type: 'flavor',
		attribute: 'savory',
	},
	chocolatey: {
		type: 'flavor',
		attribute: 'chocolatey',
	},
	fruity: {
		type: 'flavor',
		attribute: 'fruity',
	},
	minty: {
		type: 'flavor',
		attribute: 'minty',
	},
	salty: {
		type: 'flavor',
		attribute: 'salty',
	},
	sweet: {
		type: 'flavor',
		attribute: 'sweet',
	},
	tart: {
		type: 'flavor',
		attribute: 'tart',
	},
	floral: {
		type: 'flavor',
		attribute: 'floral',
	},
};
const getAttributeInfo = (v: string) => {
	if (!isAttribute(v)) {
		throw new Error (`${v} is not an Attribute!`);
	}
}

// -------------------------------- VARIANTS -------------------------------- //

type VariantInfo = {
	parent: string;
	variantName: string;
}
const variantLookup: Record<string, VariantInfo> = {
	cherry_flavoring: { parent: 'flavoring', variantName: 'cherry' },
	strawberry_flavoring: { parent: 'flavoring', variantName: 'strawberry' },
	raspberry_flavoring: { parent: 'flavoring', variantName: 'raspberry' },
	orange_flavoring: { parent: 'flavoring', variantName: 'orange' },
	almond_flavoring: { parent: 'flavoring', variantName: 'almond' },
	lemon_flavoring: { parent: 'flavoring', variantName: 'lemon' },
	lime_flavoring: { parent: 'flavoring', variantName: 'lime' },
	blueberry_flavoring: { parent: 'flavoring', variantName: 'blueberry' },
	ube_flavoring: { parent: 'flavoring', variantName: 'ube' },
	mint_flavoring: { parent: 'flavoring', variantName: 'mint' },
	caramel_flavoring: { parent: 'flavoring', variantName: 'caramel' },
	red_candied_flowers: { parent: 'candied_flowers', variantName: 'red' },
	white_candied_flowers: { parent: 'candied_flowers', variantName: 'white' },
	blue_candied_flowers: { parent: 'candied_flowers', variantName: 'blue' },
	yellow_candied_flowers: { parent: 'candied_flowers', variantName: 'yellow' },
	rainbow_sprinkles: { parent: 'sprinkles', variantName: 'rainbow' },
	chocolate_sprinkles: { parent: 'sprinkles', variantName: 'chocolate' },
	white_sprinkles: { parent: 'sprinkles', variantName: 'white' },
	ball_bearing_sprinkles: { parent: 'sprinkles', variantName: 'ball_bearing' },
	hard_candy_bats: { parent: 'hard_candy_shapes', variantName: 'bat' },
	hard_candy_eyeballs: { parent: 'hard_candy_shapes', variantName: 'eyeball' },
	hard_candy_ghosts: { parent: 'hard_candy_shapes', variantName: 'ghost' },
}

// -------------------------------- ITEMS -------------------------------- //

type ItemStorageType = 'bag' | 'fridge' | 'box' | 'countertop';
const isItemStorageType = (v: unknown): v is ItemStorageType => {
	if (v === 'bag') { return true; }
	if (v === 'fridge') { return true; }
	if (v === 'box') { return true; }
	if (v === 'countertop') { return true; }
	return true;
};

type ItemCategory = 'base' // raw ingredient, e.g. egg, flour, or base material, e.g. cookie dough
	| 'modifier' // optional supplement for any other category
	| 'product' // final, sellable item
	| 'filling' // optional; useable only on a finished product
	| 'decoration' // optional; useable only on a finished product
	| 'doodad' // optional; useable only on a finished product if a decoration is already present
const isItemCategory = (v: unknown): v is ItemCategory => {
	if (v === 'base') { return true; }
	if (v === 'modifier') { return true; }
	if (v === 'filling') { return true; }
	if (v === 'decoration') { return true; }
	if (v === 'doodad') { return true; }
	return true;
};
type ItemCategories = ItemCategory[];
const isItemCategories = (v: unknown): v is ItemCategories => {
	if (!Array.isArray(v)) { return false; }
	if (!v.every(isItemCategory)) { return false; }
	return true;
};

type ItemInfo = {
	storage: ItemStorageType;
	categories: ItemCategory[];
	cost: number | null;
	attributes: AttributeMap | 'from_recipe';
	infinite?: boolean;
}
const isItemInfo = (v: unknown): v is ItemInfo => {
	if (typeof v !== 'object' || v === null) {
		return false;
	}
	if (!isItemStorageType((v as ItemInfo).storage)) {
		return false;
	}
	if (!isItemCategories((v as ItemInfo).categories)) {
		return false;
	}
	if (typeof (v as ItemInfo).cost !== 'number' && (v as ItemInfo) !== null) {
		return false;
	}
	if (!isAttributeMap((v as ItemInfo).attributes)) {
		return false;
	}
	return true;
};

const itemInfoMap: Record<string, ItemInfo> = {
	flour: {
		storage: 'bag',
		categories: [ 'base' ],
		cost: 1,
		attributes: {
			pale: 1,
		},
	},
	sugar: {
		storage: 'bag',
		categories: [ 'base' ],
		cost: 1,
		attributes: {
			sweet: 2,
		},
	},
	egg: {
		storage: 'fridge',
		categories: [ 'base' ],
		cost: 1,
		attributes: {},
	},
	cream: {
		storage: 'fridge',
		categories: [ 'base' ],
		cost: 2,
		attributes: {
			pale: 2,
		},
	},
	cocoa_powder: {
		storage: 'bag',
		categories: [ 'modifier' ],
		cost: 3,
		attributes: {
			chocolatey: 1,
			dark: 1,
		},
	},
	chocolate_bar: {
		storage: 'box',
		categories: [ 'base' ],
		cost: 2,
		attributes: {
			chocolatey: 1,
		},
	},
	cherry_flavoring: {
		storage: 'countertop',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 2,
			red: 1,
			purple: 1,
			dark: 2,
		},
	},
	strawberry_flavoring: {
		storage: 'countertop',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 2,
			red: 1,
			dark: 1,
		},
	},
	raspberry_flavoring: {
		storage: 'countertop',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 2,
			red: 2,
			dark: 1,
		},
	},
	orange_flavoring: {
		storage: 'countertop',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 2,
			orange: 2,
			dark: 1,
		},
	},
	almond_flavoring: {
		storage: 'countertop',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			nutty: 1,
			orange: 1,
		},
	},
	lemon_flavoring: {
		storage: 'countertop',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 1,
			tart: 2,
			yellow: 2,
		},
	},
	lime_flavoring: {
		storage: 'countertop',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 1,
			tart: 2,
			yellow: 2,
		},
	},
	blueberry_flavoring: {
		storage: 'countertop',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 2,
			blue: 1,
			purple: 1,
			dark: 1,
		},
	},
	ube_flavoring: {
		storage: 'countertop',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			purple: 2,
			dark: 1,
		},
	},
	mint_flavoring: {
		storage: 'countertop',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			minty: 3,
			green: 1,
			blue: 1,
			dark: 1,
		},
	},
	caramel_flavoring: {
		storage: 'countertop',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 2,
			red: 2,
			dark: 2,
		},
	},
	red_candied_flowers: {
		storage: 'countertop',
		categories: [ 'doodad' ],
		cost: 5,
		attributes: {
			red: 1,
			pop: 1,
		},
	},
	white_candied_flowers: {
		storage: 'countertop',
		categories: [ 'doodad' ],
		cost: 5,
		attributes: {
			pale: 2,
			pop: 1,
		},
	},
	blue_candied_flowers: {
		storage: 'countertop',
		categories: [ 'doodad' ],
		cost: 5,
		attributes: {
			blue: 1,
			pop: 1,
		},
	},
	yellow_candied_flowers: {
		storage: 'countertop',
		categories: [ 'doodad' ],
		cost: 5,
		attributes: {
			yellow: 1,
			pop: 1,
		},
	},
	rainbow_sprinkles: {
		storage: 'countertop',
		categories: [ 'modifier', 'doodad' ],
		cost: 2,
		attributes: {
			varigated: 1,
			pop: 1,
		},
	},
	chocolate_sprinkles: {
		storage: 'countertop',
		categories: [ 'modifier', 'doodad' ],
		cost: 2,
		attributes: {
			pop: 1,
		},
	},
	white_sprinkles: {
		storage: 'countertop',
		categories: [ 'modifier', 'doodad' ],
		cost: 2,
		attributes: {
			pale: 1,
			pop: 1,
		},
	},
	ball_bearing_sprinkles: {
		storage: 'countertop',
		categories: [ 'modifier', 'doodad' ],
		cost: 2,
		attributes: {
			pale: 1,
			pop: 2,
		},
	},
	hard_candy_bats: {
		storage: 'countertop',
		categories: [ 'doodad' ],
		cost: 3,
		attributes: {
			pop: 1,
		},
	},
	hard_candy_eyeballs: {
		storage: 'countertop',
		categories: [ 'doodad' ],
		cost: 3,
		attributes: {
			varigated: 1,
			pop: 1,
		},
	},
	hard_candy_ghosts: {
		storage: 'countertop',
		categories: [ 'doodad' ],
		cost: 3,
		attributes: {
			pop: 1,
		},
	},
	chocolate_chips: {
		storage: 'countertop',
		categories: ['modifier', 'doodad'],
		cost: 3,
		attributes: 'from_recipe',
	},
	frosting: {
		storage: 'countertop',
		categories: ['decoration'],
		cost: 2,
		attributes: 'from_recipe',
	},
	whipped_cream: {
		storage: 'fridge',
		categories: ['filling', 'decoration'],
		cost: 2,
		attributes: 'from_recipe',
	},
	pastry_cream: {
		storage: 'fridge',
		categories: ['filling'],
		cost: 3,
		attributes: 'from_recipe',
	},
	pudding: {
		storage: 'fridge',
		categories: ['filling'],
		cost: 3,
		attributes: 'from_recipe',
	},
	cookie_dough: {
		storage: 'fridge',
		categories: ['base'],
		cost: 2,
		attributes: 'from_recipe',
	},
	cake_batter: {
		storage: 'fridge',
		categories: ['base'],
		cost: 2,
		attributes: 'from_recipe',
	},
	cookie: {
		storage: 'countertop',
		categories: ['product'],
		cost: null,
		attributes: 'from_recipe',
	},
	cupcake: {
		storage: 'countertop',
		categories: ['product'],
		cost: null,
		attributes: 'from_recipe',
	},
	cake: {
		storage: 'fridge',
		categories: ['product'],
		cost: null,
		attributes: 'from_recipe',
	},
	cake_slice: {
		storage: 'fridge',
		categories: ['product'],
		cost: null,
		attributes: 'from_recipe',
	},
};

// -------------------------------- RECIPES -------------------------------- //

type RecipeInfo = {
	output: string;
	quantity: number;
	location: string; // the appliance or tool to use
	bakeWith?: string; // what kind of pan to use
	time: number; // not exact time, but "short"/"medium"/"long" tiers
	newAttributes: AttributeMap, // attributes to add to the output
	// these will add their attributes to the output:
	ingredients: string[],
	allowedModifiers: string[]; // this will affect the product display name
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
			dark: 1,
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

const getRecipesForProduct = (product: string) => {
	const recipes = Object.values(recipeList).filter(v=>v.output === product);
	if (recipes.length === 0) {
		throw new Error (`No recipes found for product ${product}`);
	}
	return recipes;
};
const getFirstRecipeForProduct = (product: string) => {
	const recipes = getRecipesForProduct(product);
	return recipes[0];
};
const getRecipesForLocation = (location: string) => {
	const recipes = Object.values(recipeList).filter(v=>v.location === location);
	if (recipes.length === 0) {
		throw new Error (`No recipes found for location ${location}`);
	}
	return recipes;
};

const isModifierAllowedInRecipe = (modifier: string, recipe: RecipeInfo): boolean => {
	if (recipe.allowedModifiers.includes(modifier)) {
		return true;
	}
	// If we're here, we might need to look it up by its parent name
	// E.g. cherry_flavoring -> flavoring
	const variantInfo = variantLookup[modifier];
	if (variantInfo === undefined) {
		// item not a valid modifier
		return false;
	}
	const parentName = variantInfo.parent;
	if (recipe.allowedModifiers.includes(parentName)) {
		return true;
	}
	return false;
};

// -------------------------------- FINISHERS (filling, decorations) -------------------------------- //

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
}
const productFinishers: Record<string, ProductFinisherInfo> = {
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
	const ret = productFinishers[product];
	if (ret === undefined) {
		throw new Error (`No finisher info found for product ${product}`)
	}
	return ret;
};

const isFinisherAllowedOnProduct = (finisherName: string, finisherType: ProductFinisherType, product: string): boolean => {
	const finishers = getFinisherInfo(product);
	if (finishers[finisherType].includes(finisherName)) {
		return true;
	}
	// If we're here, we might need to look it up by its parent name
	// E.g. cherry_flavoring -> flavoring
	const variantInfo = variantLookup[finisherName];
	if (variantInfo === undefined) {
		// item incompatible for this finisher layer
		return false;
	}
	const parentName = variantInfo.parent;
	if (finishers[finisherType].includes(parentName)) {
		return true;
	}
	return false;
};

// -------------------------------- BUILDING THE THINGS -------------------------------- //

const getItemInfo = (item: string) => {
	const info = itemInfoMap[item];
	if (info === undefined) {
		throw new Error (`Cannot find item info for ${item}`);
	}
	return info;
}

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

const addAttributesToMap = (a: AttributeMap, b: AttributeMap) => {
	const keysA = Object.keys(a);
	const keysB = Object.keys(b);
	const keys = new Set([...keysA, ...keysB]);
	[...keys].forEach(key=>{
		if (!isAttribute(key)) { throw new Error (`${key} is not an attribute!`)}
		a[key] = (a[key] || 0) + (b[key] || 0);
	})
	return a;
};

// QUICK TEST

const recipeAttributeCache: Record<string, AttributeMap> = {};

// Note: this does not account for any modifiers atm
const getAttributesForItem = (item: string) => {
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

	// IMPORTANT NOTE!! Cooking darkens it slightly! Auto add "dark: 1"
	if (recipe.bakeWith !== undefined) {
		addAttributesToMap(attributes, {dark: 1});
	}

	recipeAttributeCache[item] = attributes;
	return attributes;
};

// Fill out the basic cache
recipeList.forEach(recipe=>{
	getAttributesForItem(recipe.output);
});

// Check the output
// console.log(recipeAttributeCache)

// ------------------------------ A SECOND QUICK TEST ------------------------------

type IngredientUnit = {
	item: string;
	quantity: number;
	modifiers: string[];
};
const isIngredientUnit = (v: unknown): v is IngredientUnit => {
	if (typeof (v as IngredientUnit).item !== 'string') { return false; }
	if (typeof (v as IngredientUnit).quantity !== 'number') { return false; }
	if (!Array.isArray((v as IngredientUnit).modifiers)) { return false; }
	if (!((v as IngredientUnit).modifiers.every(v=>typeof v === 'string'))) { return false; }
	return true;
};

const ingredientUnitsToTallies = (ingredients: IngredientUnit[]) => {
	const ret: Tallies = {};
	ingredients.forEach(v=>{
		ret[v.item] = (ret[v.item] || 0) + v.quantity
	})
	return ret;
};

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
