import { isFinisherAllowedOnProduct, itemIsBareFinisherTypeForProduct, productSellBatchSize } from "./finishers.ts";
import type { StorageType } from "./items.ts";
import { getItemInfo, isStorageType, itemMatchesStorageType } from "./items.ts";

import { cookEval, turnCookEvalIntoOutput } from "./recipes.ts";

import type { Pan, Ingredient, Item, Product, FillingInjector } from "./utilities.ts";
import {
	addItems,
	cleanString,
	getInnermostItem,
	getOneInnermostItem,
	isIngredient,
	isPan,
	isProduct,
	getOneRootItem,
	itemsCanStack,
	rootItemSubtract,
	printItem,
	innermostItemSubtract,
	addItemToList,
	getXInnermostItems,
	clearInnermostItems,
	isContainer,
	isFillingInjector,
	containerMayContain,
	isItem,
	panMayContain,
} from "./utilities.ts";

// ------------------------------------------ PRINTING ------------------------------------------ //

export const header = `-----------------------------------------------------------------`;

export const status = (s: State): string[] => {
	return [
		`GOLD: ${s.gold}`,
		`CARRYING: ${printItem(s.hand)}`,
		`HERE: ${printTile(s.tiles[s.tile_index]).join('\n')}`,
	]
}

export const log = (s: State, message: string) => {
	const bar = status(s).join('\n');
	console.log('')
	console.log(`> [${s.tile_index}] ${message}`);
	console.log('')
	console.log(`${bar}`)
	console.log('')
	console.log(header);
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

export type Tile = StorageTile | OvenTile | ApplianceTile | DeliveryZoneTile | CountertopTile | TrashTile;
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
	trash: {
		new: () => newTrashTile(),
		info: `Banish items or mixes to the shadow realm. (Pans are ineligible)`
	}
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
export const printTile = (v: Tile | null | undefined): string[] => {
	if (v === undefined) { return [`(out of bounds)`]; }
	if (v === null) { return [`(EMPTY TILE)`]; }
	if (isStorageTile(v)) { return printStorageTile(v); }
	if (isOvenTile(v)) { return printOvenTile(v); }
	if (isApplianceTile(v)) { return printApplianceTile(v); }
	if (isDeliveryZoneTile(v)) { return printDeliveryZoneTile(v); }
	if (isCountertopTile(v)) { return printCountertopTile(v); }
	if (isTrashTile(v)) { return printTrashTile(v); }
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
export type StorageTileInnards = Ingredient | Product | Pan | FillingInjector | null;
export const isStorageTileInnards = (v: unknown): v is StorageTileInnards => {
	if (typeof v !== 'object') { return false; }
	return v === null || isIngredient(v) || isProduct(v) || isPan(v) || isFillingInjector(v)
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
			if (s.hand === null) {

				// hand is empty, box is empty -> STOP
				if (ret.inside === null) {
					errorLog(s, `'pickup: cannot pick up anything from empty storage ${type}`);
					return false;
				}

				// hand is empty, box is full -> PICKUP (1)
				const toPickup = getOneRootItem(ret.inside);
				const remainder = rootItemSubtract(ret.inside, 1);
				s.hand = toPickup; // replace what's in hand
				ret.inside = remainder; // adjust remaining stock
				log(s, `Picked up ${printItem(toPickup)} from storage ${type}!`);
				return true;
			}

			// holding an empty container, box contents are are compatible with container -> PICKUP (1)
			if (
				isContainer(s.hand)
				&& s.hand.contents === null
				&& ret.inside !== null
				&& !isContainer(ret.inside) // also what's inside the box is not a container
				&& containerMayContain(s.hand.name, ret.inside.name)
			) {
				const toPickup = getOneRootItem(ret.inside);
				const remainder = rootItemSubtract(ret.inside, 1);
				s.hand.contents = toPickup;	 // add to the container	
				ret.inside = remainder; // adjust remaining stock
				if (
					isFillingInjector(s.hand)
					|| isPan(s.hand) && s.hand.name === 'muffin_tin'
				) {
					log(s, `Picked up ${printItem(toPickup)} from storage ${type} and put it in the ${s.hand.name}!`);
				} else {
					log(s, `Picked up ${printItem(toPickup)} from storage ${type} and put it on the ${s.hand.name}!`);
				}
			}

			const carriedInnerItem = getInnermostItem(s.hand);
			const inBox = ret.inside;

			// inner held item cannot stack with what's in the box -> STOP
			if (inBox !== null && !itemsCanStack(carriedInnerItem, inBox)) {
				errorLog(s, `drop: ${printItem(carriedInnerItem)} cannot stack with ${printItem(inBox)}`);
				return false;
			}

			// inner held item can't go in this kind of box -> STOP
			if (!ret.item_is_compatible(carriedInnerItem)) {
				errorLog(s, `'drop: ${cleanString(carriedInnerItem.name)}' cannot be put into storage type: ${type}`);
				return false;
			}

			// inner held item CAN stack with what's in the box -> DROP (1)
			const toDrop = getOneInnermostItem(s.hand);
			const remainder = innermostItemSubtract(s.hand, 1);
			s.hand = remainder;
			ret.inside = addItems(toDrop, inBox);
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
	if (!isItem(contents)) {
		throw new Error (`Storage contents must be ingredients, products, or small containers!`);
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
			if (ret.inside.contents === null) {
				errorLog(s, `Can't use oven without anything on the pan inside: ${ret.inside.name}!`);
				return false;
			}
			// what's on the pan is not an ingredient -> DO NOTHING
			if (!isIngredient(ret.inside.contents)) {
				errorLog(s, `${printItem(ret.inside.contents)} ineligible for baking!`);
				return false;
			}
			// otherwise -> BAKE!
			const eva = cookEval('oven', [ret.inside.contents], ret.inside.name);
			if (eva.errorCount > 0) {
				throw new Error (`This shouldn't happen, but there were ${eva.errorCount} errors trying to bake ${ret.inside.contents.name} with a ${ret.inside.name}`)
			}
			const newPanInner = turnCookEvalIntoOutput(eva);
			ret.inside.contents = newPanInner;
			log(s, `Baked ${printItem(newPanInner)}!`);
			return true;
		},
		pickup_or_drop: (s) => {
			if (s.hand === null) {
				
				// hand is empty, oven is empty -> DO NOTHING
				if (ret.inside === null) {
					errorLog(s, `'pickup: cannot pick up anything from empty oven`);
					return false;
				}

				// hand is empty, oven has something inside -> PICKUP (1) (whole pan)
				const toPickup = getOneRootItem(ret.inside);
				const remainder = rootItemSubtract(ret.inside, 1);
				s.hand = toPickup; // replace what's in hand
				ret.inside = remainder; // adjust remaining stock
				log(s, `Picked up ${printItem(toPickup)} from oven!`);
				return true;
			}

			if (isPan(s.hand)) {
				
				// holding a pan, oven is empty -> DROP (1)
				if (ret.inside === null) {
					const toDrop = getOneRootItem(s.hand)
					const remainder = rootItemSubtract(s.hand, 1);
					s.hand = remainder;
					ret.inside = toDrop;
					log(s, `Put ${printItem(toDrop)} in the oven!`);
					return true;
				}

				// holding a pan, oven has a pan, ~~and at least one has something on it~~ -> SWAP ALL
				if (isPan(s.hand)
					&& isPan(ret.inside)
					// && !(isEmptyPan(s.hand) && isEmptyPan(ret.inside))
				) {
					const inHand = s.hand;
					const fromOven = ret.inside;
					ret.inside = inHand;
					s.hand = fromOven;
					log(s, `Swapped ${printItem(inHand)} for ${printItem(fromOven)} from oven!`);
					return true;
				}
			}

			// SAFETY
			if (!isPan(ret.inside)) {
				throw new Error ("UNREACHABLE: ovens can only contain pans")
			}

			// holding a non-pan, oven is empty -> DO NOTHING
			if (!isPan(s.hand) && ret.inside === null) {
				errorLog(s, `${printItem(s.hand)} can't go in the oven!)`);
				return false;
			}

			// holding a non-pan, oven has a full pan -> DO NOTHING
			if (isPan(ret.inside) && ret.inside.contents !== null) {
				errorLog(s, `Can't pick up ${printItem(ret.inside.contents)} from the oven with your hands full!`);
				return false;
			}

			const innerHand = getInnermostItem(s.hand);
			
			// holding a non-pan, oven has empty pan, items are NOT compatible -> DO NOTHING
			if (!panMayContain(ret.inside.name, innerHand.name)) {
				errorLog(s, `${printItem(s.hand)} can't go in the oven!`);
				return false;
			}

			// SAFETY
			if (isContainer(innerHand)) {
				throw new Error ("UNREACHABLE: filling injectors should be eliminated by now")
			}
			
			// holding a non-pan, oven has empty pan, items are compatible -> DROP (1)
			const remainder = rootItemSubtract(s.hand, 1);
			s.hand = remainder;
			ret.inside.contents = innerHand;
			log(s, `Put ${printItem(innerHand)} in/on the ${cleanString(ret.inside.name)} inside the oven!`);
			return true;
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
};
export type ApplianceTileInnards = Ingredient|Product;
export const isApplianceTileInnards = (v: unknown): v is ApplianceTileInnards => {
	if (typeof v !== 'object') { return false; }
	return isProduct(v) || isIngredient(v);
};

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

			if (ret.inside.length === 1) {
				const insideUs = ret.inside[0];

				// carrying nothing OR carrying empty&&compatible container and appliance has only 1 thing -> PICKUP (1)
				if (
					s.hand === null
					|| isContainer(s.hand)
					&& s.hand.contents === null
					&& containerMayContain(s.hand.name, insideUs.name)
				) {
					const toPickup = getOneRootItem(insideUs);
					if (isContainer(toPickup)) { throw new Error ("UNREACHABLE") }
					const remainder = rootItemSubtract(insideUs, 1);
					if (isContainer(s.hand)) {
						s.hand.contents = toPickup;
					} else {
						s.hand = toPickup;
					}
					ret.inside = remainder !== null ? [remainder] : [];
					const suffix = isContainer(s.hand) ? ` and put it on the ${s.hand.name}!` : '!';
					log(s, `Picked up ${printItem(toPickup)} from the ${cleanString(type)}${suffix}`);
					return true;
				}
			}

			// carrying nothing OR carrying empty container -> STOP
			if (
				s.hand === null 
				|| isContainer(s.hand)
				&& s.hand.contents === null
			) {
				if (ret.inside.length === 0) {
					errorLog(s, `Nothing in hand to put into ${cleanString(type)}.`)
				} else {
					errorLog(s, `Cannot remove partially combined items ${inStrings[type]}.`)
				}
				return false;
			}

			// carrying something, contents are anything -> DROP (1)
			const toDrop = getOneRootItem(s.hand);
			const remainder = rootItemSubtract(s.hand, 1);
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
	deliver: (s: State, v: Product) => boolean;
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
		interact: (s: State) => {
			// holding nothing -> DO NOTHING
			if (s.hand === null) {
				errorLog(s, `Nothing in hand to deliver.`)
				return false;
			}

			const inner = getInnermostItem(s.hand);
			// holding something you can't sell -> DO NOTHING
			if (!isProduct(inner)) {
				errorLog(s, `That cannot be sold. (${printItem(inner)})`)
				return false;
			}
			// holding something you can sell -> DROP (1)
			const toDrop = getOneInnermostItem(inner);
			const remainder = innermostItemSubtract(s.hand, 1);
			if (!isDeliveryZoneTileInnards(toDrop)) { throw new Error ("IF YOU REACH HERE YOU MESSED UP"); }
			s.hand = remainder;
			ret.deliver(s, toDrop);
			return true;
		},
		pickup_or_drop: (s) => {
			errorLog(s, `In future, this is how you can arrange the display case? Pickup/drop?`)
			return false;
		},
		deliver: (s, v: Product) => {
			const batched = structuredClone(v);
			batched.quantity *= productSellBatchSize(v.name);
			addItemToList(batched, ret.inside);
			log(s, `Put ${printItem(batched)} into the display case for sale!`)
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
};
export type CountertopTileInnards = Item | null;
export const isCountertopTileInnards = (v: unknown): v is CountertopTileInnards => {
	if (typeof v !== 'object') { return false; }
	return v === null || isItem(v);
};

export const newCountertopTile = (type = ''): CountertopTile => {
	const ret: CountertopTile = {
		tile: 'countertop',
		type,
		inside: null,
		item_is_compatible: (item: Item) => isCountertopTileInnards(item),
		interact: (s: State) => {
			// if counter is empty -> DO NOTHING
			if (ret.inside === null) {
				errorLog(s, `Nothing here to interact with.`);
				return false;
			}
			
			// if what's on the counter is a product, we can try to finish it
			// (ignore any pans in this transaction, hence 'innermost')

			const counterInner = getInnermostItem(ret.inside);
			if (isProduct(counterInner)) {

				// product on counteer, empty handed -> DO NOTHING
				if (s.hand === null) {
					errorLog(s, `Cannot add finisher to product empty handed!`);
					return false;
				}

				// product on counter, holding bare finisher...
				// (we're checking inside a pan if holding one though in case you put sprinkles on a pan for some reason?)
				// TODO: for fillings, which need an applicator, you'l have to check the root item though; check for that before this
				const handInner = getInnermostItem(s.hand);
				const bareFinisherType = itemIsBareFinisherTypeForProduct(handInner.name, counterInner.name);
				if (
					bareFinisherType !== null
					&& isIngredient(handInner)
				) {

					// not enough finisher to add to entirety of product stack -> DO NOTHING
					if (handInner.quantity < counterInner.quantity) {
						errorLog(s, `Not enough ${printItem(handInner)} to apply to ${printItem(counterInner)}`);
						return false;
					}

					// if finisher type is doodad and product has no decoration yet -> DO NOTHING
					if (bareFinisherType === 'doodads' && counterInner.decorations.length === 0 ) {
						errorLog(s, `These ${printItem(handInner)} won't stick to ${printItem(counterInner)}!\nTry applying a decoration first, like frosting or whipped cream.`);
						return false;
					}

					// otherwise -> APPLY FINISHER (at COUNTER QUANTITY)
					const quantity = counterInner.quantity
					const toDrop = getXInnermostItems(s.hand, quantity);
					const remainder = innermostItemSubtract(s.hand, quantity);
					addItemToList(toDrop, counterInner[bareFinisherType]); // apply to the product finisher list
					s.hand = remainder; // adjust remaining stock in hand
					log(s, `Decorated ${printItem(counterInner)} with ${printItem(toDrop)}!`)
					return true;
				}

				// holding full injector, product on the counter...
				if (
					isFillingInjector(s.hand)
					&& handInner !== null
					&& isFinisherAllowedOnProduct(handInner.name, 'fillings', counterInner.name)
				) {
					// not enough finisher to add to entirety of product stack -> DO NOTHING
					if (handInner.quantity < counterInner.quantity) {
						errorLog(s, `Not enough ${printItem(handInner)} to apply to ${printItem(counterInner)}`);
						return false;
					}

					// otherwise -> APPLY FINISHER (at COUNTER QUANTITY)
					const quantity = counterInner.quantity
					const toDrop = getXInnermostItems(s.hand, quantity);
					const remainder = innermostItemSubtract(s.hand, quantity);
					addItemToList(toDrop, counterInner['fillings']); // apply to the product filling list
					s.hand = remainder; // adjust remaining stock in hand
					log(s, `Filled ${printItem(counterInner)} with ${printItem(toDrop)}!`)
					return true;
				}
			}
			errorLog(s, `MAY BE UNREACHABLE!`);
			return false;
		},
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

			// holding something, countertop has something, they can stack -> DROP (1)
			// TODO: Q. if these can stack things, why buy storage boxes?
			if (itemsCanStack(s.hand, ret.inside)) {
				const toDrop = getOneRootItem(s.hand);
				const remainder = rootItemSubtract(s.hand, 1);
				ret.inside = addItems(toDrop, ret.inside); // combine quantities
				s.hand = remainder; // adjust remaining stock in hand
				log(s, `Put ${printItem(toDrop)} on the countertop! (New countertop quantity: ${ret.inside?.quantity})`);
				return true;
			}

			// for "dropping" a finisher on a product, see INTERACT

			// holding something, countertop has something, they CANNOT stack -> SWAP
			const inHand = s.hand;
			const fromCounter = ret.inside;
			ret.inside = inHand;
			s.hand = fromCounter;
			log(s, `Swapped ${printItem(inHand)} for ${printItem(fromCounter)} from countertop!`);
			return true;

			// OR should we do this?

			// // holding something, something on the counter, cannot stack -> DO NOTHING
			// errorLog(s, `drop: ${printItem(s.hand)} cannot stack with ${printItem(ret.inside)}`);
			// return false;
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

// --------------------------------------- TRASH -------------------------------- //

export const isTrashTile = (v: unknown): v is TrashTile => (v as TrashTile)?.tile === 'trash';
export type TrashTile = TileCommon & {
	tile: 'trash';
};

export const newTrashTile = (type = ''): TrashTile => {
	const ret: TrashTile = {
		tile: 'trash',
		type,
		item_is_compatible: (item: Item) => !isContainer(item),
		interact: (s: State) => ret.pickup_or_drop(s),
		pickup_or_drop: (s) => {
			// carrying nothing -> DO NOTHING
			if (s.hand === null) {
				warnLog(s, `Nothing to discard.`)
				return false;
			}
			
			// carrying empty container -> DO NOTHING
			if (isContainer(s.hand) && s.hand.contents === null) {
				errorLog(s, `Cannot throw out a ${cleanString(s.hand.name)}!`)
				return false;
			}
			
			// otherwise -> DROP (ALL) (inner)
			const inner = getInnermostItem(s.hand);
			s.hand = clearInnermostItems(s.hand);
			log(s, `Threw out ${printItem(inner)}!`);
			return true;
		},
	}
	return ret;
};
export const printTrashTile = (tile: TrashTile): string[] => {
	return [`trash can`];
};
