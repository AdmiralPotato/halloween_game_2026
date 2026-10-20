import type { Ingredient, Item, Product } from "./utilities.ts";
import { itemsCanStack } from "./utilities.ts";

import { isAttributeMap, type AttributeMap } from "./attributes.ts";

export type StorageType = 'bag' | 'fridge' | 'freezer' | 'crate' | 'jar' | 'pan_stand';
export const isStorageType = (v: unknown): v is StorageType => {
	if (v === 'bag') { return true; }
	if (v === 'fridge') { return true; }
	if (v === 'freezer') { return true; }
	if (v === 'crate') { return true; }
	if (v === 'jar') { return true; }
	return false;
};

export type ItemCategory = 'base' // raw ingredient, e.g. egg, flour, or base material, e.g. cookie dough
	| 'modifier' // optional supplement for any other category
	| 'product' // final, sellable item
	| 'fillings' // optional; useable only on a finished product
	| 'decorations' // optional; useable only on a finished product
	| 'doodads' // optional; useable only on a finished product if a decoration is already present
	| 'container'
const isItemCategory = (v: unknown): v is ItemCategory => {
	if (v === 'base') { return true; }
	if (v === 'modifier') { return true; }
	if (v === 'fillings') { return true; }
	if (v === 'decorations') { return true; }
	if (v === 'doodads') { return true; }
	if (v === 'container') { return true; }
	return false;
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
	stackSize: number;
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

export const newIngredient = (name: string, quantity: number, modifiers?: string[]): Ingredient => {
	return {
		name,
		quantity,
		modifiers: modifiers || [],
	}	
};
export const newProduct = (name: string, quantity: number, modifiers?: string[], fillings?: Ingredient[], decorations?: Ingredient[], doodads?: Ingredient[]): Product => {
	return {
		name,
		quantity,
		modifiers: modifiers || [],
		fillings: fillings || [],
		decorations: decorations || [],
		doodads: doodads || []
	}
};

const FLAVORING_STACK_SIZE = 50;
const CANDIED_FLOWERS_STACK_SIZE = 9;
const SPRINKLES_STACK_SIZE = 50;
const HARD_CANDY_SHAPES_STACK_SIZE = 20;

const itemInfoMap: Record<string, ItemInfo> = {
	flour: {
		storageType: 'bag',
		categories: [ 'base' ],
		cost: 1,
		stackSize: 1,
		attributes: {
			pale: 1,
		},
	},
	sugar: {
		storageType: 'bag',
		categories: [ 'base' ],
		cost: 1,
		stackSize: 1,
		attributes: {
			sweet: 2,
		},
	},
	egg: {
		storageType: 'fridge',
		categories: [ 'base' ],
		cost: 1,
		stackSize: 12,
		attributes: {},
	},
	cream: {
		storageType: 'fridge',
		categories: [ 'base' ],
		cost: 2,
		stackSize: 4,
		attributes: {
			pale: 2,
		},
	},
	cocoa_powder: {
		storageType: 'bag',
		categories: [ 'modifier' ],
		cost: 3,
		stackSize: 4,
		attributes: {
			chocolatey: 2,
			pale: -2,
			brown: 2,
		},
	},
	chocolate_bar: {
		storageType: 'crate',
		categories: [ 'base' ],
		cost: 2,
		stackSize: 12,
		attributes: {
			chocolatey: 1,
		},
	},
	cherry_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		stackSize: FLAVORING_STACK_SIZE,
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
		stackSize: FLAVORING_STACK_SIZE,
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
		stackSize: FLAVORING_STACK_SIZE,
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
		stackSize: FLAVORING_STACK_SIZE,
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
		stackSize: FLAVORING_STACK_SIZE,
		attributes: {
			nutty: 1,
			brown: 1,
		},
	},
	lemon_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		stackSize: FLAVORING_STACK_SIZE,
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
		stackSize: FLAVORING_STACK_SIZE,
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
		stackSize: FLAVORING_STACK_SIZE,
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
		stackSize: FLAVORING_STACK_SIZE,
		attributes: {
			purple: 2,
			pale: -1,
		},
	},
	mint_flavoring: {
		storageType: 'jar',
		categories: [ 'modifier' ],
		cost: 4,
		stackSize: FLAVORING_STACK_SIZE,
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
		stackSize: FLAVORING_STACK_SIZE,
		attributes: {
			fruity: 2,
			red: 2,
			pale: -2,
		},
	},
	red_candied_flowers: {
		storageType: 'jar',
		categories: [ 'doodads' ],
		cost: 5,
		stackSize: CANDIED_FLOWERS_STACK_SIZE,
		attributes: {
			red: 9,
			pop: 1,
		},
	},
	white_candied_flowers: {
		storageType: 'jar',
		categories: [ 'doodads' ],
		cost: 5,
		stackSize: CANDIED_FLOWERS_STACK_SIZE,
		attributes: {
			pale: 2,
			pop: 1,
		},
	},
	blue_candied_flowers: {
		storageType: 'jar',
		categories: [ 'doodads' ],
		cost: 5,
		stackSize: CANDIED_FLOWERS_STACK_SIZE,
		attributes: {
			blue: 1,
			pop: 1,
		},
	},
	yellow_candied_flowers: {
		storageType: 'jar',
		categories: [ 'doodads' ],
		cost: 5,
		stackSize: CANDIED_FLOWERS_STACK_SIZE,
		attributes: {
			yellow: 1,
			pop: 1,
		},
	},
	rainbow_sprinkles: {
		storageType: 'jar',
		categories: [ 'modifier', 'doodads' ],
		cost: 2,
		stackSize: SPRINKLES_STACK_SIZE,
		attributes: {
			varigated: 1,
			pop: 1,
		},
	},
	chocolate_sprinkles: {
		storageType: 'jar',
		categories: [ 'modifier', 'doodads' ],
		cost: 2,
		stackSize: SPRINKLES_STACK_SIZE,
		attributes: {
			pop: 1,
		},
	},
	white_sprinkles: {
		storageType: 'jar',
		categories: [ 'modifier', 'doodads' ],
		cost: 2,
		stackSize: SPRINKLES_STACK_SIZE,
		attributes: {
			pale: 1,
			pop: 1,
		},
	},
	ball_bearing_sprinkles: {
		storageType: 'jar',
		categories: [ 'modifier', 'doodads' ],
		cost: 2,
		stackSize: SPRINKLES_STACK_SIZE,
		attributes: {
			pale: 1,
			pop: 2,
		},
	},
	hard_candy_bats: {
		storageType: 'jar',
		categories: [ 'doodads' ],
		cost: 3,
		stackSize: HARD_CANDY_SHAPES_STACK_SIZE,
		attributes: {
			pop: 1,
		},
	},
	hard_candy_eyeballs: {
		storageType: 'jar',
		categories: [ 'doodads' ],
		cost: 3,
		stackSize: HARD_CANDY_SHAPES_STACK_SIZE,
		attributes: {
			varigated: 1,
			pop: 1,
		},
	},
	hard_candy_ghosts: {
		storageType: 'jar',
		categories: [ 'doodads' ],
		cost: 3,
		stackSize: HARD_CANDY_SHAPES_STACK_SIZE,
		attributes: {
			pop: 1,
		},
	},
	chocolate_chips: {
		storageType: 'jar',
		categories: ['modifier', 'doodads'],
		cost: 3,
		stackSize: 9,
		attributes: 'from_recipe',
	},
	frosting: {
		storageType: 'jar',
		categories: ['decorations'],
		cost: 2,
		stackSize: 4,
		attributes: 'from_recipe',
	},
	whipped_cream: {
		storageType: 'fridge',
		categories: ['fillings', 'decorations'],
		cost: 2,
		stackSize: 1,
		attributes: 'from_recipe',
	},
	pastry_cream: {
		storageType: 'fridge',
		categories: ['fillings'],
		cost: 3,
		stackSize: 1,
		attributes: 'from_recipe',
	},
	pudding: {
		storageType: 'fridge',
		categories: ['fillings'],
		cost: 3,
		stackSize: 1,
		attributes: 'from_recipe',
	},
	cookie_dough: {
		storageType: 'fridge',
		categories: ['base'],
		cost: 2,
		stackSize: 1,
		attributes: 'from_recipe',
	},
	cake_batter: {
		storageType: 'fridge',
		categories: ['base'],
		cost: 2,
		stackSize: 1,
		attributes: 'from_recipe',
	},
	cookie: {
		storageType: 'crate',
		categories: ['product'],
		cost: null,
		stackSize: 1,
		attributes: 'from_recipe',
	},
	cupcake: {
		storageType: 'fridge',
		categories: ['product'],
		cost: null,
		stackSize: 1,
		attributes: 'from_recipe',
	},
	cake: {
		storageType: 'fridge',
		categories: ['product'],
		cost: null,
		stackSize: 1,
		attributes: 'from_recipe',
	},
	cake_slice: {
		storageType: 'fridge',
		categories: ['product'],
		cost: null,
		stackSize: 1,
		attributes: 'from_recipe',
	},
	cookie_sheet: {
		storageType: 'crate',
		categories: ['container'],
		cost: 2,
		stackSize: 5,
		attributes: {},
	},
	muffin_tin: {
		storageType: 'crate',
		categories: ['container'],
		cost: 2,
		stackSize: 5,
		attributes: {},
	},
	cake_pan: {
		storageType: 'crate',
		categories: ['container'],
		cost: 2,
		stackSize: 5,
		attributes: {},
	},
	filling_injector: {
		storageType: 'crate',
		categories: ['container'],
		cost: 2,
		stackSize: 4,
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

export const itemMatchesStorageType = (item: Item, storageType: string) => {
	const info = getItemInfo(item.name);
	return info.storageType === storageType;
}

// ----------------------------------------- STACKING SUPPLEMENTAL ----------------------------------------- //

export const getStackSize = (item: Item) => {
	const itemInfo = getItemInfo(item.name);
	return itemInfo.stackSize;
}
type StackAttemptInfo<T extends Item> = {
	left: T,
	right: T,
};
export const stackLeftOntoRight = <T extends Item>(left: T, right: T): StackAttemptInfo<T> | null => {
	if (!itemsCanStack(left, right)) {
		return null;
	}
	const itemStackSize = getItemInfo(right.name).stackSize;
	if (itemStackSize < right.quantity) {
		throw new Error ("ASSERT FAILED: item is stacked more than is allowed")
	}
	const amountToMove = itemStackSize - right.quantity;
	if (amountToMove === 0) {
		return { left, right };
	}
	const newLeft = structuredClone(left);
	const newRight = structuredClone(right);
	newLeft.quantity -= amountToMove;
	newRight.quantity += amountToMove;
	return {
		left: newLeft,
		right: newRight,
	};
};


