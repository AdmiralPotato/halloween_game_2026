import { isAttributeMap, type AttributeMap } from "./attributes.ts";

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
	if (!isAttributeMap((v as ItemInfo).attributes) && (v as ItemInfo).attributes !== 'from_recipe') {
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

export const getItemInfo = (item: string) => {
	const info = itemInfoMap[item];
	if (info === undefined) {
		throw new Error (`Cannot find item info for ${item}`);
	}
	return info;
};
