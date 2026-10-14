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

type Color = 'pale' | 'dark' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'varigated';
type Texture = 'dry' | 'moist' | 'soft' | 'hard' | 'sticky' | 'crumbly' | 'pop';
type Flavor = 'nutty' | 'savory' | 'chocolatey' | 'fruity' | 'minty' | 'salty' | 'sweet' | 'tart' | 'floral';
type Temperature = 'cold' | 'hot';
type Allergy = 'dairy' | 'egg' | 'milk' | 'tree_nut';
type Attribute = Color | Texture | Flavor | Temperature | Allergy;
type AttributeMap = Partial<Record<Attribute, number>>;
type AttributeInfo = {
	attribute: string;
	type: 'color';
	neighbors?: Color[];
	opposite?: Color
} | {
	attribute: string;
	type: 'texture';
	opposite?: Texture;
} | {
	attribute: string;
	type: 'flavor';
	opposite?: Flavor;
} | {
	attribute: string;
	type: 'temperature';
	opposite?: Temperature;
} | {
	attribute: string;
	type: 'allergy';
};
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
	cold: {
		type: 'temperature',
		attribute: 'cold',
		opposite: 'hot',
	},
	hot: {
		type: 'temperature',
		attribute: 'hot',
		opposite: 'cold',
	},
	dairy: {
		type: 'allergy',
		attribute: 'dairy',
	},
	egg: {
		type: 'allergy',
		attribute: 'egg',
	},
	milk: {
		type: 'allergy',
		attribute: 'milk',
	},
	tree_nut: {
		type: 'allergy',
		attribute: 'tree_nut',
	},
};

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
	hard_candy_bats: { parent: 'hard_candy_shapes', variant_name: 'bats' },
	hard_candy_eyeballs: { parent: 'hard_candy_shapes', variant_name: 'eyeballs' },
	hard_candy_ghosts: { parent: 'hard_candy_shapes', variant_name: 'ghosts' },
}

// -------------------------------- ITEMS -------------------------------- //


type StorageType = 'bag' | 'fridge' | 'box' | 'countertop';
type ItemInfo = {
	storage: StorageType;
	cost: number | null;
	attributes: AttributeMap;
	infinite?: boolean;
}
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
		attributes: {
			egg: 1,
		},
	},
	cream: {
		storage: 'fridge',
		cost: 2,
		attributes: {
			dairy: 2,
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
	finished?: boolean;
	quantity: number;
	location: string;
	time_tier: number;
	ingredients: string[],
	add_attributes: AttributeMap,
	allowed_modifiers?: string[];
	modifier_threshold?: number;
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
		modifier_threshold: 2,
	},
	whipped_cream: {
		product: 'whipped_cream',
		quantity: 3,
		location: 'mixer',
		time_tier: 3,
		ingredients: [ 'cream' ],
		add_attributes: {
			pale: 3,
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
			pale: 1,
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
		modifier_threshold: 2,
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
		modifier_threshold: 2,
	},
	cookie: {
		product: 'cookie',
		finished: true,
		quantity: 12,
		location: 'oven',
		time_tier: 2,
		ingredients: [ 'cookie_dough' ],
		add_attributes: {
			dark: 1,
		},
	},
	cupcake_batter: {
		product: 'cupcake_batter',
		quantity: 1,
		location: 'mixer',
		time_tier: 2,
		ingredients: [ 'flour', 'flour', 'sugar' ],
		add_attributes: {
			soft: 1,
		},
		allowed_modifiers: [
			'cocoa_powder',
			'flavoring',
			'chocolate_chips',
		],
		modifier_threshold: 2,
	},
	cupcake: {
		product: 'cupcake',
		finished: true,
		quantity: 6,
		location: 'oven',
		time_tier: 2,
		ingredients: [ 'cupcake_batter' ],
		add_attributes: {
			dark: 1,
		},
	},
	cake_batter: {
		product: 'cake_batter',
		quantity: 1,
		location: 'mixer',
		time_tier: 3,
		ingredients: [ 'flour', 'flour', 'sugar', 'egg' ],
		add_attributes: {
			soft: 2,
		},
		allowed_modifiers: [
			'cocoa_powder',
			'flavoring',
			'shredded_carrot',
		],
		modifier_threshold: 2,
	},
	cake: {
		product: 'cake',
		finished: true,
		quantity: 1,
		location: 'oven',
		time_tier: 2,
		ingredients: [ 'cake_batter' ],
		add_attributes: {
			dark: 1
		},
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

const jumbo_recipes = {
	cookie: { servings: 3 },
	cupcake: { servings: 2 },
	cake: { servings: 1 },
};

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
			'jam',
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
			'jam',
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

const addAttributesToMap = (a: AttributeMap, b: AttributeMap) => {
	const keysA = Object.keys(a);
	const keysB = Object.keys(b);
	const keys = new Set([...keysA, ...keysB]);
	[...keys].forEach(key=>{
		a[key] = (a[key] || 0) + (b[key] || 0);
	})
	return a;
};
