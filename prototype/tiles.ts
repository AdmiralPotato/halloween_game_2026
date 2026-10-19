import type { StorageType } from "./items.ts";
import { getItemInfo, isStorageType, itemMatchesStorageType, newIngredient } from "./items.ts";

import { cookEval, turnCookEvalIntoOutput } from "./recipes.ts";

import type { Pan, Ingredient, Item, Product } from "./utilities.ts";
import {
	addItems,
	capitalizeAndClean,
	cleanString,
	getInnermostItem,
	getOneInnermostItem,
	isIngredient,
	isPan,
	isProduct,
	getOneRootItem,
	itemsCanStack,
	rootItemSubtract,
	panMayContain,
	printItem,
	innermostItemSubtract,
	isEmptyPan,
	addItemToList
} from "./utilities.ts";

// ------------------------------------------ PRINTING ------------------------------------------ //

export const header = `-----------------------------------------------------------------`;
const getTileName = (s: State): string => {
	const tile = s.tiles[s.tile_index];
	return tile
		? tile.tile
		: tile === null
			? 'NULL'
			: '(out of bounds)';
};
export const log = (s: State, message: string) => {
	console.log(header);
	console.log(`[${s.tile_index}] ${message}`);
};
export const warnLog = (s: State, message: string) => {
	console.warn(header);
	console.warn(`[${s.tile_index}] ${message}`);
};
export const errorLog = (s: State, message: string) => {
	console.error(header);
	console.error(`[${s.tile_index}] ${message}`);
};

export const inStrings: Record<string, string> = {
	oven: `in the oven`,
	mixer: `in the mixer`,
	cutting_board: `on the cutting board`,
	hand: `in your hands`,
	decorating_stand: `on the decorating stand`,
	display_case: `into the display case`,
	countertop: `on the countertop`,
	storage: `in storage`,
}
export const intoStrings: Record<string, string> = {
	oven: `into the oven`,
	mixer: `into the mixer`,
	cutting_board: `onto the cutting board`,
	hand: `into your hands`,
	decorating_stand: `onto the decorating stand`,
	display_case: `into the display case`,
	countertop: `onto the countertop`,
	storage: `into storage`,
}
export const fromStrings: Record<string, string> = {
	oven: `from the oven`,
	mixer: `from the mixer`,
	cutting_board: `from the cutting board`,
	hand: `from your hands`,
	decorating_stand: `from the decorating stand`,
	display_case: `from the display case`,
	countertop: `from the countertop`,
	storage: `from storage`,
};

// ------------------------------------------ STATE ------------------------------------------ //

export type State = {
	hand: Item | null;
	gold: number;
	tile_index: number;
	tiles: (Tile | null)[];
	current_tile: () => Tile | null | undefined;
}
export const newState = (tiles: (Tile|null)[]): State => {
	const s: State = {
		hand: null,
		gold: 100,
		tile_index: 0,
		tiles,
		// undefined means out of bounds; null means empty tile
		current_tile: (): Tile | null | undefined => {
			const tile = s.tiles[s.tile_index];
			return tile;
		},
	}
	return s;
};

// ------------------------------------------ TILE TYPES ------------------------------------------ //

export type Tile = StorageTile | OvenTile | ApplianceTile | DeliveryZoneTile | CountertopTile;
type TileCommon = {
	tile: string;
	type: string;
	interact: (s: State) => boolean;
	item_is_compatible: (item: Item) => boolean;
	pickup_or_drop: (s: State) => boolean;
}

type TileInfo = {
	new: (type: string) => Tile;
	newWith?: (contents: Item, type?: string) => Tile;
	info: string;
}

const tiles: Record<string, TileInfo> = {
	storage: {
		new: (type) => newStorageTile(type),
		newWith: (contents) => newFilledStorageTile(contents),
		info: 'Cold or hot storage solutions available.'
	},
	oven: {
		new: (type = 'oven') => newOvenTile(type),
		info: 'May only contain pans (with or without food). INTERACT to use.',
	},
	cutting_board: {
		new: () => newApplianceTile('cutting_board'),
		info: `May contain multiple food items at once. INTERACT to use.`
	},
	mixer: {
		new: () => newApplianceTile('mixer'),
		info: `May contain multiple food items at once. INTERACT to use.`
	},
	delivery_zone: {
		new: (type) => newDeliveryZoneTile(type),
		info: `Drop products off here to make them available for sale.`,
	},
	countertop: {
		new: (type) => newCountertopTile(type),
		newWith: (contents, type) => newCountertopTileWith(contents, type),
		info: `A general work area.`,
	},
}
export const newTile = (type: string, contents?: Item) => {
	const info = tiles[type];
	if (!info) {
		throw new Error (`No tile info entry found for type '${type}'`)
	}
	if (contents === undefined) {
		return info.new(type);
	} else if (info.newWith !== undefined) {
		return info.newWith(contents, type);
	}
	throw new Error (`Something went wrong trying to run newTile`)
};
export const printTile = (v: Tile | null): string[] => {
	if (v === null) { return [`(EMPTY TILE)`]; }
	if (isStorageTile(v)) { return printStorageTile(v); }
	if (isOvenTile(v)) { return printOvenTile(v); }
	if (isApplianceTile(v)) { return printApplianceTile(v); }
	if (isDeliveryZoneTile(v)) { return printDeliveryZoneTile(v); }
	if (isCountertopTile(v)) { return printCountertopTile(v); }
	throw new Error (`printTile: tile type not handled not handled`)
}

// --------------------------------------- STORAGE TILE -------------------------------- //

export const isStorageTile = (v: unknown): v is StorageTile => (v as StorageTile)?.tile === 'storage';
export type StorageTile = TileCommon & {
	tile: 'storage';
	type: StorageType;
	inside: StorageTileInnards;
	restock: (count: number) => boolean;
};
export type StorageTileInnards = Ingredient | Product | Pan | null;
export const isStorageTileInnards = (v: unknown): v is StorageTileInnards => {
	if (typeof v !== 'object') { return false; }
	return v === null || isIngredient(v) || isProduct(v) || isPan(v)
};
export const newStorageTile = (type: string): StorageTile => {
	if (!isStorageType(type)) {
		throw new Error (`${type} is not a valid storage type`);
	}
	const ret: StorageTile = {
		tile: 'storage',
		type,
		inside: null,
		item_is_compatible: (item: Item) => {
			// can't just check isStorageTileInnards, because it accepts everything
			// And we gotta check what's inside the pan if we're carrying one
			const innermostItem = getInnermostItem(item);
			return itemMatchesStorageType(innermostItem, type);
		},
		pickup_or_drop: (s: State) => {
			// hand is empty -> TRY TO PICKUP...

			if (s.hand === null) {

				// if nothing is in the box -> STOP
				if (ret.inside === null) {
					errorLog(s, `'pickup: cannot pick up anything from empty storage ${type}`);
					return false;
				}

				// otherwise -> PICKUP (1)
				const toPickup = getOneInnermostItem(ret.inside);
				const remainder = innermostItemSubtract(ret.inside, 1);
				s.hand = toPickup; // replace what's in hand
				ret.inside = remainder; // adjust remaining stock
				log(s, `Picked up ${printItem(toPickup)} from storage ${type}!`);
				return true;
			}

			// carried item is empty pan, and what's inside us is compatible -> PICKUP (1)
			if (
				isPan(s.hand)
				&& isEmptyPan(s.hand)
				&& ret.inside !== null
				&& panMayContain(s.hand.name, ret.inside.name)
			) {
				const toPickup = getOneInnermostItem(ret.inside);
				const remainder = innermostItemSubtract(ret.inside, 1);
				if (isPan(toPickup)) { throw new Error ("UNREACHABLE") }
				s.hand.carrying = toPickup;	 // add to the pan	
				ret.inside = remainder; // adjust remaining stock
				log(s, `Picked up ${printItem(toPickup)} from storage ${type} and put it on the ${s.hand.name}!`);
			}

			// otherwise TRY TO DROP...

			const carriedItem = getInnermostItem(s.hand); // might be food, or might be the food on a pan
			const insideUs = ret.inside;

			// carried item can't go in the type of us we are -> STOP
			if (!ret.item_is_compatible(carriedItem)) {
				errorLog(s, `'drop: ${cleanString(carriedItem.name)}' cannot be put into storage type: ${type}`);
				return false;
			}

			// we have something inside us already, but carried item can't stack with it -> STOP
			if (insideUs !== null && !itemsCanStack(carriedItem, insideUs)) {
				errorLog(s, `drop: ${printItem(carriedItem)} cannot stack with ${printItem(insideUs)}`);
				return false;
			}

			// items can stack, good to go! -> DROP (1)
			const toDrop = getOneInnermostItem(s.hand);
			const remainder = innermostItemSubtract(s.hand, 1);
			s.hand = remainder;
			ret.inside = addItems(toDrop, insideUs);
			log(s, `Dropped ${printItem(toDrop)} into storage ${type}!`);
			return true;
		},
		interact: (s) => ret.pickup_or_drop(s),
		restock: function (increaseBy: number): boolean {
			if (ret.inside === null) {
				return false;
			}
			ret.inside.quantity += increaseBy;
			return true;
		},
	};
	return ret;
};
export const newFilledStorageTile = (contents: Item): StorageTile => {
	if (!isIngredient(contents) && !isProduct(contents)) {
		throw new Error (`Storage contents must be product or food component!`);
	}
	const itemInfo = getItemInfo(contents.name);
	const tile = newStorageTile(itemInfo.storageType);
	tile.inside = contents;
	return tile;
};
export const printStorageTile = (tile: StorageTile): string[] => {
	return [`storage ${tile.type}: ${tile.inside ? printItem(tile.inside) : '(nothing)'}`];
};

// --------------------------------------- OVEN -------------------------------- //

export const isOvenTile = (v: unknown): v is OvenTile => (v as OvenTile)?.tile === 'oven';
export type OvenTile = TileCommon & {
	tile: 'oven';
	inside: OvenTileInnards;
	interact: (s: State) => boolean;
	pickup_or_drop: (s: State) => boolean;
};
export type OvenTileInnards = Pan | null;
export const isOvenTileInnards = (v: unknown): v is OvenTileInnards => {
	if (typeof v !== 'object') { return false; }
	return v === null || isPan(v);
};

// May only contain pans (with or without food on them)

export const newOvenTile = (type = ''): OvenTile => {
	const ret: OvenTile = {
		tile: 'oven',
		type,
		inside: null,
		item_is_compatible: (item: Item) => isOvenTileInnards(item),
		interact: (s) => {
			// we're empty -> DO NOTHING
			if (ret.inside === null) {
				errorLog(s, `Can't use oven without anything inside!`);
				return false;
			}

			// pan inside us is empty -> DO NOTHING
			if (ret.inside.carrying === null) {
				errorLog(s, `Can't use oven without anything on the pan inside: ${ret.inside.name}!`);
				return false;
			}
			// what's on the pan is not an ingredient -> DO NOTHING
			if (!isIngredient(ret.inside.carrying)) {
				errorLog(s, `${printItem(ret.inside.carrying)} ineligible for baking!`);
				return false;
			}
			// otherwise -> BAKE!
			const eva = cookEval('oven', [ret.inside.carrying], ret.inside.name);
			if (eva.errorCount > 0) {
				throw new Error (`This shouldn't happen, but there were ${eva.errorCount} errors trying to bake ${ret.inside.carrying.name} with a ${ret.inside.name}`)
			}
			const newPanInner = turnCookEvalIntoOutput(eva);
			ret.inside.carrying = newPanInner;
			log(s, `Baked ${printItem(newPanInner)}!`);
			return true;
		},
		pickup_or_drop: (s) => {
			// hand is empty...
			if (s.hand === null) {
				
				// if nothing is inside us -> DO NOTHING
				if (ret.inside === null) {
					errorLog(s, `'pickup: cannot pick up anything from empty oven`);
					return false;
				}

				// otherwise -> PICKUP (1)
				const toPickup = getOneInnermostItem(ret.inside);
				const remainder = innermostItemSubtract(ret.inside, 1);
				s.hand = toPickup; // replace what's in hand
				ret.inside = remainder; // adjust remaining stock
				log(s, `Picked up ${printItem(toPickup)} from oven!`);
				return true;
			}

			// hand is full...

			// carried item is not a pan -> DO NOTHING
			if (!isPan(s.hand)) {
				errorLog(s, `Only pans can go in the oven! (Carrying ${printItem(s.hand)})`);
				return false;
			}

			// oven is empty -> DROP (1)
			if (ret.inside === null) {
				const toDrop = getOneInnermostItem(s.hand);
				const remainder = innermostItemSubtract(s.hand, 1);
				if (!isPan(toDrop)) { throw new Error ("UNREACHABLE") }
				s.hand = remainder;
				ret.inside = toDrop;
				log(s, `Put ${printItem(toDrop)} in the oven!`);
				return true;
			}

			// oven isn't empty -> SWAP ALL
			if (isPan(s.hand) && ret.inside !== null) {
				const fromOven = ret.inside;
				const inHand = s.hand;
				s.hand = fromOven;
				ret.inside = inHand;
				log(s, `Swapped ${printItem(inHand)} for ${printItem(fromOven)} from oven!`);
				return true;
			}

			throw new Error ("UNREACHABLE (?)");
		},
	};
	return ret;
};
export const printOvenTile = (tile: OvenTile): string[] => {
	return [`oven: ${tile.inside ? printItem(tile.inside) : '(empty)'}`];
};

// --------------------------------------- APPLIANCES -------------------------------- //

export const isApplianceTile = (v: unknown): v is ApplianceTile => (v as ApplianceTile)?.tile === 'appliance';
export type ApplianceTile = TileCommon & {
	tile: 'appliance';
	inside: ApplianceTileInnards[];
	interact: (s: State) => boolean;
	pickup_or_drop: (s: State) => boolean;
};
export type ApplianceTileInnards = Ingredient|Product;
export const isApplianceTileInnards = (v: unknown): v is ApplianceTileInnards => {
	if (typeof v !== 'object') { return false; }
	return isProduct(v) || isIngredient(v);
};

// Can only contain food (no pans)
// Can contain more than 1 thing

export const newApplianceTile = (type: string): ApplianceTile => {
	const ret: ApplianceTile = {
		tile: 'appliance',
		type,
		inside: [],
		item_is_compatible: (item: Item) => isApplianceTileInnards(item),
		interact: (s) => {
			// storage empty -> DO NOTHING
			if (ret.inside.length === 0) {
				errorLog(s, `Cannot use ${cleanString(type)} without anything inside!`)
				return false;
			}
			// otherwise...
			const eva = cookEval(type, ret.inside);
			// not a real recipe -> DO NOTHING
			if (eva.errorCount > 0) {
				errorLog(s, `${type}: Those ingredients will not produce anything viable.`);
				return false;
			}
			// otherwise -> MAKE IT
			const output = turnCookEvalIntoOutput(eva);
			ret.inside = [ output ];
			log(s, `Made ${printItem(output)} at the ${cleanString(type)}!`);
			return true;
		},
		pickup_or_drop: (s) => {

			// we have 1 item inside us... can pickup if we want to
			if (ret.inside.length === 1) {
				const insideUs = ret.inside[0];

				// hands are empty OR we have an empty, compatible pan -> PICKUP (1)
				if (
					s.hand === null
					|| isPan(s.hand)
					&& s.hand.carrying === null
					&& panMayContain(s.hand.name, insideUs.name)
				) {
					const toPickup = getOneRootItem(insideUs);
					if (isPan(toPickup)) { throw new Error ("UNREACHABLE") }
					const remainder = rootItemSubtract(insideUs, 1);
					if (isPan(s.hand)) {
						s.hand.carrying = toPickup;
					} else {
						s.hand = toPickup;
					}
					ret.inside = remainder !== null ? [remainder] : [];
					const suffix = isPan(s.hand) ? ` and put it on the ${s.hand.name}!` : '!';
					log(s, `Picked up ${printItem(toPickup)} from the ${cleanString(type)}${suffix}`);
					return true;
				}
			}

			// otherwise...

			// hands are empty OR hands are an empty pan -> STOP
			if (
				s.hand === null 
				|| isPan(s.hand)
				&& s.hand.carrying === null
			) {
				if (ret.inside.length === 0) {
					errorLog(s, `Nothing in hand to put into ${cleanString(type)}.`)
				} else {
					errorLog(s, `Cannot remove partially combined items ${inStrings[type]}.`)
				}
				return false;
			}

			// otherwise -> DROP (1)
			const toDrop = getOneInnermostItem(s.hand);
			const remainder = innermostItemSubtract(s.hand, 1);
			if (!isApplianceTileInnards(toDrop)) { throw new Error ("IF YOU REACH HERE YOU MESSED UP"); }
			s.hand = remainder;
			addItemToList(toDrop, ret.inside);
			log(s, `Dropped ${printItem(toDrop)} into ${type}!`);
			return true;
		},
	};
	return ret;
};
export const printApplianceTile = (tile: ApplianceTile): string[] => {
	if (tile.inside.length === 0) {
		return [`${cleanString(tile.tile)} ${cleanString(tile.type)}: (empty)`];
	} else if (tile.inside.length === 1) {
		return [`${cleanString(tile.tile)} ${cleanString(tile.type)}: ${printItem(tile.inside[0])}`];
	} else {
		return [
			`${cleanString(tile.tile)} ${cleanString(tile.type)}:`,
			...tile.inside.map(v=>'      - '+printItem(v)),
		];
	}
};

// --------------------------------------- DELIVERY ZONE -------------------------------- //

export const isDeliveryZoneTile = (v: unknown): v is DeliveryZoneTile => (v as DeliveryZoneTile)?.tile === 'delivery_zone';
export type DeliveryZoneTile = TileCommon & {
	tile: 'delivery_zone';
	inside: DeliveryZoneTileInnards[],
	interact: (s: State) => boolean;
	pickup_or_drop: (s: State) => boolean;
	deliver: (v: Item) => boolean;
};
export type DeliveryZoneTileInnards = Product;
export const isDeliveryZoneTileInnards = (v: unknown): v is DeliveryZoneTileInnards => {
	if (typeof v !== 'object') { return false; }
	return isProduct(v);
};

export const newDeliveryZoneTile = (type: string): DeliveryZoneTile => {
	const ret: DeliveryZoneTile = {
		tile: 'delivery_zone',
		type,
		inside: [],
		item_is_compatible: (item: Item) => isDeliveryZoneTileInnards(item),
		interact: () => false,
		pickup_or_drop: (s) => {
			// holding nothing OR an empty pan -> DO NOTHING
			if (
				s.hand === null
				|| isPan(s.hand)
				&& s.hand.carrying === null
			) {
				errorLog(s, `Nothing in hand to deliver.`)
				return false;
			}
			// holding something you can't sell -> DO NOTHING
			if (!isProduct(s.hand)) {
				errorLog(s, `That cannot be sold. (${printItem(s.hand)})`)
				return false;
			}
			// otherwise -> DROP (1)
			const toDrop = getOneInnermostItem(s.hand);
			const remainder = innermostItemSubtract(s.hand, 1);
			if (!isDeliveryZoneTileInnards(toDrop)) { throw new Error ("IF YOU REACH HERE YOU MESSED UP"); }
			if (isPan(s.hand)) {
				s.hand.carrying = remainder;
			} else {
				s.hand = remainder;
			}
			addItemToList(toDrop, ret.inside);
			log(s, `Dropped ${printItem(toDrop)} off to be sold!`);
			return true;
			
		},
		deliver: (v: Item) => {
			// TODO
			return false;
		}
	}
	return ret;
};
export const printDeliveryZoneTile = (tile: DeliveryZoneTile): string[] => {
	return [`delivery zone`];
};

// --------------------------------------- COUNTERTOP -------------------------------- //

export const isCountertopTile = (v: unknown): v is CountertopTile => (v as CountertopTile)?.tile === 'countertop';
export type CountertopTile = TileCommon & {
	tile: 'countertop';
	inside: CountertopTileInnards;
	interact: (s: State) => boolean;
	pickup_or_drop: (s: State) => boolean;
};
export type CountertopTileInnards = Item | null;
export const isCountertopTileInnards = (v: unknown): v is CountertopTileInnards => {
	if (typeof v !== 'object') { return false; }
	return v === null || isIngredient(v) || isProduct(v) || isPan(v);
};

export const newCountertopTile = (type = ''): CountertopTile => {
	const ret: CountertopTile = {
		tile: 'countertop',
		type,
		inside: null,
		item_is_compatible: (item: Item) => isCountertopTileInnards(item),
		interact: () => false,
		pickup_or_drop: (s) => {
			if (s.hand === null) {
				// holding nothing, nothing on the counter -> DO NOTHING
				if (ret.inside === null) {
					errorLog(s, `pickup: Countertop is empty.`)
					return false;
				}
				// holding nothing, something on the counter -> PICKUP (1)
				const toPickup = getOneRootItem(ret.inside);
				const remainder = rootItemSubtract(ret.inside, 1);
				s.hand = toPickup; // replace what's in hand
				ret.inside = remainder; // adjust remaining stock
				log(s, `Picked up ${printItem(toPickup)} from countertop!`);
				return true;
			}

			// holding something, nothing on the counter -> DROP (1)
			if (ret.inside === null) {
				const toDrop = getOneRootItem(s.hand);
				const remainder = rootItemSubtract(s.hand, 1);
				ret.inside = toDrop; // replace what's on the counter
				s.hand = remainder; // adjust remaining stock in hand
				log(s, `Put ${printItem(toDrop)} on the countertop!`);
				return true;
			}

			// holding a pan, countertop has a pan, and at least 1 has something on it -> SWAP
			if (
				isPan(s.hand)
				&& isPan(ret.inside)
				&& !(isEmptyPan(s.hand) && isEmptyPan(ret.inside))
			) {
				const inHand = s.hand;
				const fromCounter = ret.inside;
				ret.inside = inHand;
				s.hand = fromCounter;
				log(s, `Swapped ${printItem(inHand)} for ${printItem(fromCounter)} from countertop!`);
				return true;
			}

			// holding something, something on the counter, and they can stack -> DROP (1)
			if (itemsCanStack(s.hand, ret.inside)) {
				const toDrop = getOneRootItem(s.hand);
				const remainder = rootItemSubtract(s.hand, 1);
				ret.inside = addItems(toDrop, ret.inside); // combine quantities
				s.hand = remainder; // adjust remaining stock in hand
				log(s, `Put ${printItem(toDrop)} on the countertop! (New stack size: ${ret.inside?.quantity})`);
				return true;
			}

			// holding something, something on the counter, cannot stack -> DO NOTHING
			errorLog(s, `drop: ${printItem(s.hand)} cannot stack with ${printItem(ret.inside)}`);
			return false;
		},
	}
	return ret;
};

export const newCountertopTileWith = (contents: Item, type?: string): CountertopTile => {
	const tile = newCountertopTile(type);
	tile.inside = contents;
	return tile;
};
export const printCountertopTile = (tile: CountertopTile): string[] => {
	return [`countertop: ${tile.inside ? printItem(tile.inside) : '(nothing)'}`];
};
