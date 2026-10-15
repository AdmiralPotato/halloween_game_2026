const mapToList = (map: Record<string, number>): string[] => {
	const ret: string[] = [];
	Object.entries(map).forEach(([k,v])=>{
		for (let i = 0; i < v; i++) {
			ret.push(k);
			
		}
	})
	return ret;
};
const listToMap = (list: string[]): Record<string, number> => {
	const ret: Record<string, number> = {};
	list.forEach(item=>{
		ret[item] = (ret[item] || 0) + 1;
	})
	return ret;
};

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

const variantLookup = {
	cherry_flavoring: { parent: 'flavoring', variant_name: 'cherry' },
	strawberry_flavoring: { parent: 'flavoring', variant_name: 'strawberry' },
	raspberry_flavoring: { parent: 'flavoring', variant_name: 'raspberry' },
	orange_flavoring: { parent: 'flavoring', variant_name: 'orange' },
	almond_flavoring: { parent: 'flavoring', variant_name: 'almond' },
	lemon_flavoring: { parent: 'flavoring', variant_name: 'lemon' },
	lime_flavoring: { parent: 'flavoring', variant_name: 'lime' },
	blueberry_flavoring: { parent: 'flavoring', variant_name: 'blueberry' },
	ube_flavoring: { parent: 'flavoring', variant_name: 'ube' },
	mint_flavoring: { parent: 'flavoring', variant_name: 'mint' },
	caramel_flavoring: { parent: 'flavoring', variant_name: 'caramel' },
	red_candied_flowers: { parent: 'candied_flowers', variant_name: 'red' },
	white_candied_flowers: { parent: 'candied_flowers', variant_name: 'white' },
	blue_candied_flowers: { parent: 'candied_flowers', variant_name: 'blue' },
	yellow_candied_flowers: { parent: 'candied_flowers', variant_name: 'yellow' },
	rainbow_sprinkles: { parent: 'sprinkles', variant_name: 'rainbow' },
	chocolate_sprinkles: { parent: 'sprinkles', variant_name: 'chocolate' },
	white_sprinkles: { parent: 'sprinkles', variant_name: 'white' },
	ball_bearing_sprinkles: { parent: 'sprinkles', variant_name: 'ball_bearing' },
	hard_candy_bats: { parent: 'hard_candy_shapes', variant_name: 'bat' },
	hard_candy_eyeballs: { parent: 'hard_candy_shapes', variant_name: 'eyeball' },
	hard_candy_ghosts: { parent: 'hard_candy_shapes', variant_name: 'ghost' },
}

// -------------------------------- ITEMS -------------------------------- //

type StorageType = 'bag' | 'fridge' | 'box' | 'countertop';
const isStorageType = (v: unknown): v is StorageType => {
	if (v === 'bag') { return true; }
	if (v === 'fridge') { return true; }
	if (v === 'box') { return true; }
	if (v === 'countertop') { return true; }
	return true;
};

type ItemInfo = {
	storage: StorageType;
	cost: number | null;
	attributes: AttributeMap;
	infinite?: boolean;
}
const isItemInfo = (v: unknown): v is ItemInfo => {
	if (typeof v !== 'object' || v === null) {
		return false;
	}
	if (!isStorageType((v as ItemInfo).storage)) {
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

const itemInfo: Record<string, ItemInfo> = {
	flour: {
		storage: 'bag',
		cost: 1,
		attributes: {
			pale: 1,
		},
	},
	sugar: {
		storage: 'bag',
		cost: 1,
		attributes: {
			sweet: 2,
		},
	},
	egg: {
		storage: 'fridge',
		cost: 1,
		attributes: {},
	},
	cream: {
		storage: 'fridge',
		cost: 2,
		attributes: {
			pale: 2,
		},
	},
	chocolate_bar: {
		storage: 'box',
		cost: 2,
		attributes: {
			chocolatey: 1,
			dark: 1,
		},
	},
	cocoa_powder: {
		storage: 'bag',
		cost: 3,
		attributes: {
			chocolatey: 1,
			dark: 1,
		},
	},
	chocolate_chips: {
		storage: 'countertop',
		cost: 3,
		attributes: {
			chocolatey: 1,
			pop: 1,
		},
	},
	cherry_flavoring: {
		storage: 'countertop',
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
		cost: 4,
		attributes: {
			fruity: 2,
			red: 1,
			dark: 1,
		},
	},
	raspberry_flavoring: {
		storage: 'countertop',
		cost: 4,
		attributes: {
			fruity: 2,
			red: 2,
			dark: 1,
		},
	},
	orange_flavoring: {
		storage: 'countertop',
		cost: 4,
		attributes: {
			fruity: 2,
			orange: 2,
			dark: 1,
		},
	},
	almond_flavoring: {
		storage: 'countertop',
		cost: 4,
		attributes: {
			nutty: 1,
			orange: 1,
		},
	},
	lemon_flavoring: {
		storage: 'countertop',
		cost: 4,
		attributes: {
			fruity: 1,
			tart: 2,
			yellow: 2,
		},
	},
	lime_flavoring: {
		storage: 'countertop',
		cost: 4,
		attributes: {
			fruity: 1,
			tart: 2,
			yellow: 2,
		},
	},
	blueberry_flavoring: {
		storage: 'countertop',
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
		cost: 4,
		attributes: {
			purple: 2,
			dark: 1,
		},
	},
	mint_flavoring: {
		storage: 'countertop',
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
		cost: 4,
		attributes: {
			fruity: 2,
			red: 2,
			dark: 2,
		},
	},
	red_candied_flowers: {
		storage: 'countertop',
		cost: 5,
		attributes: {
			red: 1,
			pop: 1,
		},
	},
	white_candied_flowers: {
		storage: 'countertop',
		cost: 5,
		attributes: {
			pale: 2,
			pop: 1,
		},
	},
	blue_candied_flowers: {
		storage: 'countertop',
		cost: 5,
		attributes: {
			blue: 1,
			pop: 1,
		},
	},
	yellow_candied_flowers: {
		storage: 'countertop',
		cost: 5,
		attributes: {
			yellow: 1,
			pop: 1,
		},
	},
	rainbow_sprinkles: {
		storage: 'countertop',
		cost: 2,
		attributes: {
			varigated: 1,
			pop: 1,
		},
	},
	chocolate_sprinkles: {
		storage: 'countertop',
		cost: 2,
		attributes: {
			pop: 1,
		},
	},
	white_sprinkles: {
		storage: 'countertop',
		cost: 2,
		attributes: {
			pale: 1,
			pop: 1,
		},
	},
	ball_bearing_sprinkles: {
		storage: 'countertop',
		cost: 2,
		attributes: {
			pale: 1,
			pop: 2,
		},
	},
	hard_candy_bats: {
		storage: 'countertop',
		cost: 3,
		attributes: {
			pop: 1,
		},
	},
	hard_candy_eyeballs: {
		storage: 'countertop',
		cost: 3,
		attributes: {
			varigated: 1,
			pop: 1,
		},
	},
	hard_candy_ghosts: {
		storage: 'countertop',
		cost: 3,
		attributes: {
			pop: 1,
		},
	},
};

// -------------------------------- RECIPES -------------------------------- //

type RecipeListing = {
	product: string;
	finished?: boolean; // can be sold; finishers can be used on it
	quantity: number;
	location: string;
	cook_in?: string;
	time_tier: number;
	ingredients: string[],
	add_attributes: AttributeMap, // attributes to add in addition to the ingredients'
	allowed_modifiers?: string[];
}

const recipeMap: Record<string, RecipeListing> = {
	chocolate_chips: {
		product: 'chocolate_chips',
		quantity: 4,
		location: 'cutting_board',
		time_tier: 1,
		ingredients: [ 'chocolate_bar' ],
		add_attributes: {
			hard: 1
		},
	},
	frosting: {
		product: 'frosting',
		quantity: 2,
		location: 'mixer',
		time_tier: 2,
		ingredients: [ 'sugar' ],
		add_attributes: {
			pale: 3,
			soft: 1,
		},
		allowed_modifiers: [
			'cocoa_powder',
			'flavoring',
		],
	},
	whipped_cream: {
		product: 'whipped_cream',
		quantity: 3,
		location: 'mixer',
		time_tier: 3,
		ingredients: [ 'cream' ],
		add_attributes: {
			pale: 1,
			soft: 3,
		},
	},
	pastry_cream: {
		product: 'pastry_cream',
		quantity: 1,
		location: 'saucepan',
		time_tier: 2,
		ingredients: [ 'cream', 'egg' ],
		add_attributes: {
			dark: 1,
			soft: 1
		},
	},
	pudding: {
		product: 'pudding',
		quantity: 1,
		location: 'saucepan',
		time_tier: 2,
		ingredients: [ 'cream', 'sugar' ],
		add_attributes: {
			soft: 2
		},
		allowed_modifiers: [
			'cocoa_powder',
			'flavoring',
		],
	},
	cookie_dough: {
		product: 'cookie_dough',
		quantity: 1,
		location: 'mixer',
		time_tier: 2,
		ingredients: [ 'flour', 'sugar' ],
		add_attributes: {
			soft: 1,
		},
		allowed_modifiers: [
			'cocoa_powder',
			'flavoring',
			'chocolate_chips',
		],
	},
	cake_batter: {
		product: 'cake_batter',
		quantity: 1,
		location: 'mixer',
		time_tier: 2,
		ingredients: [ 'flour', 'sugar', 'egg' ],
		add_attributes: {
			soft: 1,
		},
		allowed_modifiers: [
			'cocoa_powder',
			'flavoring',
			'chocolate_chips',
			'shredded_carrot',
		],
	},
	// COOKING STEPS
	// Note: cooking adds "dark: 1"
	cookie: {
		product: 'cookie',
		finished: true,
		quantity: 12,
		location: 'oven',
		cook_in: 'jellyroll_pan',
		time_tier: 2,
		ingredients: [ 'cookie_dough' ],
		add_attributes: {},
	},
	cupcake: {
		product: 'cupcake',
		finished: true,
		quantity: 6,
		location: 'oven',
		cook_in: 'muffin_tin',
		time_tier: 3,
		ingredients: [ 'cake_batter' ],
		add_attributes: {},
	},
	cake: {
		product: 'cake',
		finished: true,
		quantity: 1,
		location: 'oven',
		cook_in: 'cake_form',
		time_tier: 4,
		ingredients: [ 'cake_batter' ],
		add_attributes: {},
	},
	cake_slice: {
		product: 'cake_slice',
		finished: true,
		quantity: 6,
		location: 'cake_knife',
		time_tier: 0,
		ingredients: [ 'cake' ],
		add_attributes: {},
	}
};

// Worry about this later
// const jumbo_recipes = {
// 	cookie: { servings: 3 },
// 	cupcake: { servings: 2 },
// 	cake: { servings: 1 },
// };

const finishers: Record<string, Record<string, string[]>> = {
	cookie: {
		allowed_fillings: [],
		allowed_decorations: [
			'frosting',
		],
		allowed_doodads: [
			'candy_shapes',
			'sprinkles',
			'candied_flowers',
		],
	},
	cupcake: {
		allowed_fillings: [
			'pastry_cream',
			'whipped_cream',
			// 'jam',
			'pudding',
		],
		allowed_decorations: [
			'frosting',
			'whipped_cream',
		],
		allowed_doodads: [
			'candy_shapes',
			'sprinkles',
			'candied_flowers',
		],
	},
	cake: {
		allowed_fillings: [
			'whipped_cream',
			// 'jam',
			'ice_cream',
		],
		allowed_decorations: [
			'frosting',
			'whipped_cream',
		],
		allowed_doodads: [
			'sprinkles',
			'candied_flowers',
		],
	},
	cake_slice: {
		allowed_fillings: [],
		allowed_decorations: [],
		allowed_doodads: [],
	},
};

// -------------------------------- BUILDING THE THINGS -------------------------------- //


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
const getAttributesForItem = (v: string, ) => {
	// Use cache, if any
	const cache = recipeAttributeCache[v];
	if (cache !== undefined) {
		return cache;
	}
	// Might be an ingredient
	const asIngredient = itemInfo[v];
	if (asIngredient !== undefined) {
		const ingredientAttributes = asIngredient.attributes;
		recipeAttributeCache[v] = ingredientAttributes;
		return ingredientAttributes;
	}
	// If it's not a product, something broke
	const asProduct = recipeMap[v];
	if (asProduct === undefined) {
		throw new Error (`No item info or recipe info found for ${v}`);
	}
	// If we're here, it's definitely a product
	const productAttributes: AttributeMap = structuredClone(asProduct.add_attributes);
	asProduct.ingredients.forEach(ingredient=>{
		const ingredientAttributes = getAttributesForItem(ingredient);
		if (ingredientAttributes === undefined) {
			throw new Error (`Could not get ingredient attributes for ${ingredient}`);
		}
		addAttributesToMap(productAttributes, ingredientAttributes);
	})
	// Cooking darkens it slightly
	if (asProduct.cook_in !== undefined) {
		addAttributesToMap(productAttributes, {dark: 1});
	}
	recipeAttributeCache[v] = productAttributes;
	return productAttributes;
};
// Fill out the cache; use cache from here(?)
Object.keys(recipeMap).forEach(k=>{
	getAttributesForItem(k);
});
console.log(recipeAttributeCache)

// A SECOND QUICK TEST

type IngredientUnit = {
	item: string;
	quantity: number;
	modifiers: string[];
};
type CookingInfo = {
	location: string;
	ingredients: IngredientUnit[];
};
type CookingTest = CookingInfo & {
	expected: IngredientUnit;
};

const testIngredients: CookingTest[] = [
	{
		location: 'mixer',
		ingredients: [
			{ item: 'flour', quantity: 1, modifiers: [] },
			{ item: 'sugar', quantity: 1, modifiers: [] },
			{ item: 'orange_flavoring', quantity: 1, modifiers: [] },
		],
		expected: {
			item: 'cookie_dough',
			quantity: 1,
			modifiers: [ 'orange_flavoring' ],
		},
	},
	{
		location: 'mixer',
		ingredients: [
			{ item: 'cookie_dough', quantity: 1, modifiers: [] },
			{ item: 'orange_flavoring', quantity: 1, modifiers: [] },
		],
		expected: {
			item: 'cookie_dough',
			quantity: 1,
			modifiers: [ 'orange_flavoring' ],
		},
	},
	{
		location: 'mixer',
		ingredients: [
			{ item: 'cookie_dough', quantity: 1, modifiers: [] },
			{ item: 'cocoa_powder', quantity: 1, modifiers: [] },
			{ item: 'orange_flavoring', quantity: 1, modifiers: [] },
		],
		expected: {
			item: 'cookie_dough',
			quantity: 1,
			modifiers: [ 'cocoa_powder', 'orange_flavoring' ],
		},
	},
	{
		location: 'mixer',
		ingredients: [
			{ item: 'cookie_dough', quantity: 1, modifiers: [ 'cocoa_powder' ] },
			{ item: 'orange_flavoring', quantity: 1, modifiers: [] },
		],
		expected: {
			item: 'cookie_dough',
			quantity: 1,
			modifiers: [ 'cocoa_powder', 'orange_flavoring' ],
		},
	},
];
