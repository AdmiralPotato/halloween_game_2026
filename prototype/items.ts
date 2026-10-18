import { isAttributeMap, type AttributeMap } from "./attributes.ts";
import type { FoodComponent, Product } from "./utilities.ts";

export type StorageType = 'bag' | 'fridge' | 'freezer' | 'crate' | 'jar';
// bag, fridge, freezer, crate are on the ground
// jar is on the countertop (while leaving space for an object also)
// All these things can also be just set on the countertop
export const isStorageType = (v: unknown): v is StorageType => {
	if (v === 'bag') { return true; }
	if (v === 'fridge') { return true; }
	if (v === 'freezer') { return true; }
	if (v === 'crate') { return true; }
	if (v === 'jar') { return true; }
	return true;
};

type ItemCategory = 'base' // raw ingredient, e.g. egg, flour, or base material, e.g. cookie dough
	| 'modifier' // optional supplement for any other category
	| 'product' // final, sellable item
	| 'filling' // optional; useable only on a finished product
	| 'decoration' // optional; useable only on a finished product
	| 'doodad' // optional; useable only on a finished product if a decoration is already present
	| 'pan'
const isItemCategory = (v: unknown): v is ItemCategory => {
	if (v === 'base') { return true; }
	if (v === 'modifier') { return true; }
	if (v === 'filling') { return true; }
	if (v === 'decoration') { return true; }
	if (v === 'doodad') { return true; }
	if (v === 'pan') { return true; }
	return true;
};
type ItemCategories = ItemCategory[];
const isItemCategories = (v: unknown): v is ItemCategories => {
	if (!Array.isArray(v)) { return false; }
	if (!v.every(isItemCategory)) { return false; }
	return true;
};

type ItemInfo = {
	storageType: StorageType;
	categories: ItemCategory[];
	cost: number | null;
	attributes: AttributeMap | 'from_recipe';
	infinite?: boolean;
}
const isItemInfo = (v: unknown): v is ItemInfo => {
	if (typeof v !== 'object' || v === null) {
		return false;
	}
	if (!isStorageType((v as ItemInfo).storageType)) {
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

export const newFoodComponent = (name: string, quantity: number, modifiers?: string[]): FoodComponent => {
	return {
		name,
		quantity,
		modifiers: modifiers || [],
	}	
};
export const newProduct = (name: string, quantity: number, modifiers?: string[], fillings?: string[], decorations?: string[], doodads?: string[]): Product => {
	return {
		name,
		quantity,
		modifiers: modifiers || [],
		fillings: [],
		decorations: [],
		doodads: []
	}
};

const itemInfoMap: Record<string, ItemInfo> = {
	flour: {
		storageType: 'bag',
		categories: [ 'base' ],
		cost: 1,
		attributes: {
			pale: 1,
		},
	},
	sugar: {
		storageType: 'bag',
		categories: [ 'base' ],
		cost: 1,
		attributes: {
			sweet: 2,
		},
	},
	egg: {
		storageType: 'fridge',
		categories: [ 'base' ],
		cost: 1,
		attributes: {},
	},
	cream: {
		storageType: 'fridge',
		categories: [ 'base' ],
		cost: 2,
		attributes: {
			pale: 2,
		},
	},
	cocoa_powder: {
		storageType: 'bag',
		categories: [ 'modifier' ],
		cost: 3,
		attributes: {
			chocolatey: 1,
			pale: -2,
			orange: 1,
		},
	},
	chocolate_bar: {
		storageType: 'crate',
		categories: [ 'base' ],
		cost: 2,
		attributes: {
			chocolatey: 1,
		},
	},
	cherry_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 2,
			red: 1,
			purple: 1,
			pale: -2,
		},
	},
	strawberry_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 2,
			red: 1,
			pale: -1,
		},
	},
	raspberry_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 2,
			red: 2,
			pale: -1,
		},
	},
	orange_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 2,
			orange: 2,
			pale: -1,
		},
	},
	almond_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			nutty: 1,
			orange: 1,
		},
	},
	lemon_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 1,
			tart: 2,
			yellow: 2,
		},
	},
	lime_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 1,
			tart: 2,
			yellow: 2,
		},
	},
	blueberry_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 2,
			blue: 1,
			pale: -1,
		},
	},
	ube_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			purple: 2,
			pale: -1,
		},
	},
	mint_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			minty: 3,
			green: 1,
			pale: -1,
		},
	},
	caramel_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		attributes: {
			fruity: 2,
			red: 2,
			pale: -2,
		},
	},
	red_candied_flowers: {
		storageType: 'jar',
		categories: [ 'doodad' ],
		cost: 5,
		attributes: {
			red: 1,
			pop: 1,
		},
	},
	white_candied_flowers: {
		storageType: 'jar',
		categories: [ 'doodad' ],
		cost: 5,
		attributes: {
			pale: 2,
			pop: 1,
		},
	},
	blue_candied_flowers: {
		storageType: 'jar',
		categories: [ 'doodad' ],
		cost: 5,
		attributes: {
			blue: 1,
			pop: 1,
		},
	},
	yellow_candied_flowers: {
		storageType: 'jar',
		categories: [ 'doodad' ],
		cost: 5,
		attributes: {
			yellow: 1,
			pop: 1,
		},
	},
	rainbow_sprinkles: {
		storageType: 'jar',
		categories: [ 'modifier', 'doodad' ],
		cost: 2,
		attributes: {
			varigated: 1,
			pop: 1,
		},
	},
	chocolate_sprinkles: {
		storageType: 'jar',
		categories: [ 'modifier', 'doodad' ],
		cost: 2,
		attributes: {
			pop: 1,
		},
	},
	white_sprinkles: {
		storageType: 'jar',
		categories: [ 'modifier', 'doodad' ],
		cost: 2,
		attributes: {
			pale: 1,
			pop: 1,
		},
	},
	ball_bearing_sprinkles: {
		storageType: 'jar',
		categories: [ 'modifier', 'doodad' ],
		cost: 2,
		attributes: {
			pale: 1,
			pop: 2,
		},
	},
	hard_candy_bats: {
		storageType: 'jar',
		categories: [ 'doodad' ],
		cost: 3,
		attributes: {
			pop: 1,
		},
	},
	hard_candy_eyeballs: {
		storageType: 'jar',
		categories: [ 'doodad' ],
		cost: 3,
		attributes: {
			varigated: 1,
			pop: 1,
		},
	},
	hard_candy_ghosts: {
		storageType: 'jar',
		categories: [ 'doodad' ],
		cost: 3,
		attributes: {
			pop: 1,
		},
	},
	chocolate_chips: {
		storageType: 'jar',
		categories: ['modifier', 'doodad'],
		cost: 3,
		attributes: 'from_recipe',
	},
	frosting: {
		storageType: 'jar',
		categories: ['decoration'],
		cost: 2,
		attributes: 'from_recipe',
	},
	whipped_cream: {
		storageType: 'fridge',
		categories: ['filling', 'decoration'],
		cost: 2,
		attributes: 'from_recipe',
	},
	pastry_cream: {
		storageType: 'fridge',
		categories: ['filling'],
		cost: 3,
		attributes: 'from_recipe',
	},
	pudding: {
		storageType: 'fridge',
		categories: ['filling'],
		cost: 3,
		attributes: 'from_recipe',
	},
	cookie_dough: {
		storageType: 'fridge',
		categories: ['base'],
		cost: 2,
		attributes: 'from_recipe',
	},
	cake_batter: {
		storageType: 'fridge',
		categories: ['base'],
		cost: 2,
		attributes: 'from_recipe',
	},
	cookie: {
		storageType: 'crate',
		categories: ['product'],
		cost: null,
		attributes: 'from_recipe',
	},
	cupcake: {
		storageType: 'fridge',
		categories: ['product'],
		cost: null,
		attributes: 'from_recipe',
	},
	cake: {
		storageType: 'fridge',
		categories: ['product'],
		cost: null,
		attributes: 'from_recipe',
	},
	cake_slice: {
		storageType: 'fridge',
		categories: ['product'],
		cost: null,
		attributes: 'from_recipe',
	},
	cookie_sheet: {
		storageType: 'crate',
		categories: ['pan'],
		cost: 2,
		attributes: {},
	},
	muffin_tin: {
		storageType: 'crate',
		categories: ['pan'],
		cost: 2,
		attributes: {},
	},
	cake_pan: {
		storageType: 'crate',
		categories: ['pan'],
		cost: 2,
		attributes: {},
	},
};

export const getItemInfo = (item: string) => {
	const info = itemInfoMap[item];
	if (info === undefined) {
		throw new Error (`Cannot find item info for ${item}`);
	}
	return info;
};
