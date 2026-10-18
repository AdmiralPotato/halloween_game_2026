import type { StorageType } from "./items.ts";
import { getItemInfo, isStorageType, newFoodComponent } from "./items.ts";

import { cookEval, turnCookEvalIntoOutput } from "./recipes.ts";

import type { Pan, FoodComponent, Item, Product } from "./utilities.ts";
import {
	capitalizeAndClean,
	cleanString,
	isFoodComponent,
	isPan,
	isProduct,
	itemsCanStack,
	panMayContain,
	printItem,
	printPan
} from "./utilities.ts";

export const header = `-----------------------------------------------------------------`;
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

export const itemSubtract = (item: Product | FoodComponent, n = 1): Product | FoodComponent | null => {
	item.quantity -= n;
	if (item.quantity === 0) {
		return null;
	}
	return item;
};
export const itemAdd = (item: Product | FoodComponent, n = 1): Product | FoodComponent => {
	item.quantity += n;
	return item;
};

// Returns the new item object (because it might have a greater quantity now, in the destination)
// Object returned might have greater quantity than provided if some where there already
export const addItemToList = (itemToAdd: Item, arr: Item[]): Item => {
	const foundIndex = arr.findIndex((v)=>itemsCanStack(itemToAdd, v));
	// Not there? Easy, just add it at the end
	if (foundIndex === -1) {
		arr.push(itemToAdd);
		return itemToAdd;
	}
	// Otherwise add our quantity to the found thing
	const item = arr[foundIndex];
	item.quantity += itemToAdd.quantity;
	return item;
};

export type State = {
	hand: Item | null;
	gold: number;
	location_index: number;
	tiles: (Tile | null)[];
}
export const newState = (): State => {
	const s: State = {
		hand: null,
		gold: 100,
		location_index: 0,
		tiles: [
			newDeliveryZoneTile(''),
			newOvenTile('oven'),
			newApplianceTile('cutting_board'),
			newApplianceTile('mixer'),
			newFilledStorageTile(newFoodComponent('flour', 20)),
			newFilledStorageTile(newFoodComponent('sugar', 25)),
			newFilledStorageTile(newFoodComponent('egg', 12)),
			newFilledStorageTile(newFoodComponent('frosting', 5)),
			newFilledStorageTile(newFoodComponent('frosting', 5, ['cocoa_powder'])),
			newFilledStorageTile(newFoodComponent('cookie_sheet', 3)),
			newFilledStorageTile(newFoodComponent('muffin_tin', 3)),
			newFilledStorageTile(newFoodComponent('cake_pan', 3)),
			newCountertopTile(''),
			newCountertopTile(''),
			newCountertopTile(''),
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
		],
	}
	return s;
};

export type Tile = StorageTile | OvenTile | ApplianceTile | DeliveryZoneTile | CountertopTile;
type TileCommon = {
	tile: string;
	type: string;
	interact: (s: State) => boolean;
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
	appliance: {
		new: (type) => newApplianceTile(type),
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
	inside: FoodComponent | Product | null;
	refill: (count: number) => boolean;
};

export const newStorageTile = (type: string): StorageTile => {
	if (!isStorageType(type)) {
		throw new Error (`${type} is not a valid storage type`);
	}
	const ret: StorageTile = {
		tile: 'storage',
		type,
		inside: null,
		interact: (s) => ret.pickup_or_drop(s),
		pickup_or_drop: (s) => {
			// Avoiding typos:
			const hand = s.hand;
			const setHand = (v: Item | null) => { s.hand = v; }
			const inner = ret.inside;
			const setInner = (v: FoodComponent | Product | null) => { ret.inside = v; }

			//////// ----------- storage full!

			if (inner !== null) {

				//// holding nothing -> PICKUP (1)
				if (hand === null) {
					setHand({ ...inner, quantity: 1 })
					const newInner = itemSubtract(inner, 1);
					setInner(newInner);
					console.log(header);
					console.log(`Picked up 1x '${inner.name}'`);
					return true;
				}

				//// holding food!
				if (isProduct(hand) || isFoodComponent(hand)) {
					// held item cannot stack with storage tile -> DO NOTHING
					if (!itemsCanStack(hand, inner)) {
						return false;
					}
					// items ARE compatible -> DROP (1)
					itemAdd(inner, 1);
					const newHandInside = itemSubtract(hand, 1)
					setHand(newHandInside);
					console.log(header);
					console.log(`Dropped 1x '${inner.name}'`);
					return true;
				}

				//// holding a pan!
				const pan = hand;
				const setPan = (v: Product|FoodComponent|null) => {
					if (!isPan(s.hand)) { throw new Error ("UNREACHABLE") }
					s.hand.carrying = v;
				};
				// pan empty...
				if (pan.carrying === null) {
					// item in storage can go on/in that pan -> PICKUP (1)
					if (panMayContain(pan.name, inner.name)) {
						setPan({ ...inner, quantity: 1 });
						const newInside = itemSubtract(inner, 1)
						setInner(newInside);
						console.log(header);
						console.log(`Put 1x '${inner.name}' on/in the ${printPan(pan)}`);
						return true;
					}
					// otherwise -> DO NOTHING
					return false;
				}
				// pan full
				// item on pan cannot stack with storage tile -> DO NOTHING
				if (!itemsCanStack(pan.carrying, inner)) {
					return false;
				}

				// otherwise -> DROP ALL (pan now empty)
				itemAdd(inner, pan.carrying.quantity)
				setPan(null);
				console.log(`Took ${pan.carrying.quantity}x '${inner.name}' off/out of the ${printPan(pan)}`);
				return true;
			}

			//////// ----------- storage empty!

			//// holding nothing -> DO NOTHING
			if (hand === null) {
				return false;
			}

			//// holding food...
			if (isProduct(hand) || isFoodComponent(hand)) {
				// held item can go in this storage type -> DROP (1)
				const foodStorageType = getItemInfo(hand.name).storageType;
				if (foodStorageType === ret.type) {
					setInner({ ...hand, quantity: 1})
					const newHand = itemSubtract(hand, 1);
					setHand(newHand);
					return true;
				}
				// otherwise -> DO NOTHING
				return false;
			}

			//// holding a pan...
			const pan = hand;
			const setPan = (v: Product|FoodComponent | null) => {
				if (!isPan(s.hand)) { throw new Error ("UNREACHABLE") }
				s.hand.carrying = v;
			}
			// pan empty -> DO NOTHING
			if (pan.carrying === null) {
				return false;
			}
			// pan food can go in this storage tile -> DROP ALL (pan is now empty)
			const panFoodStorageType = getItemInfo(pan.carrying.name).storageType;
			if (panFoodStorageType === ret.type) {
				setInner(pan.carrying);
				setPan(null);
				return true;
			}
			// otherwise -> DO NOTHING
			return false;
		},
		refill: function (increaseBy: number): boolean {
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
	if (!isFoodComponent(contents) && !isProduct(contents)) {
		throw new Error (`Storage contents must be product or food component!`);
	}
	const itemInfo = getItemInfo(contents.name);
	const tile = newStorageTile(itemInfo.storageType);
	tile.inside = contents;
	return tile;
};
export const printStorageTile = (tile: StorageTile): string[] => {
	return [`Storage ${tile.type}: ${tile.inside ? printItem(tile.inside) : '(nothing)'}`];
};

// --------------------------------------- OVEN -------------------------------- //

export const isOvenTile = (v: unknown): v is OvenTile => (v as OvenTile)?.tile === 'oven';
export type OvenTile = TileCommon & {
	tile: 'oven';
	inside: Pan | null;
	interact: (s: State) => boolean;
	pickup_or_drop: (s: State) => boolean;
}

// May only contain pans (with or without food on them)

const newOvenTile = (type = ''): OvenTile => {
	const ret: OvenTile = {
		tile: 'oven',
		type,
		inside: null,
		interact: (s) => {
			// Avoiding typos:
			const inner = ret.inside;

			// storage empty -> DO NOTHING
			if (inner === null) {
				return false;
			}

			// storage is a pan...
			const pan = inner;
			const setPan = (v: Product|FoodComponent|null) => {
				if (!isPan(s.hand)) { throw new Error ("UNREACHABLE") }
				s.hand.carrying = v;
			};
			// pan is empty -> DO NOTHING
			if (pan.carrying === null) {
				return false;
			}
			// what's on the pan is not a raw food -> DO NOTHING
			if (!isFoodComponent(pan.carrying)) {
				return false;
			}
			// otherwise -> BAKE!
			const eva = cookEval('oven', [pan.carrying], pan.name);
			if (eva.errorCount > 0) {
				throw new Error (`This shouldn't happen, but there were ${eva.errorCount} errors trying to bake ${pan.carrying.name} with a ${pan.name}`)
			}
			const newPanInner = turnCookEvalIntoOutput(eva);
			setPan(newPanInner);
			console.log(header);
			console.log(`Baked ${printItem(newPanInner)}!`);
			return true;
		},
		pickup_or_drop: (s) => {
			// Avoiding typos:
			const hand = s.hand;
			const setHand = (v: Item | null) => { s.hand = v; }
			const inner = ret.inside;
			const setInner = (v: Pan | null) => { ret.inside = v; }

			// storage empty...
			if (inner === null) {
				// holding nothing -> DO NOTHING
				if (hand === null) {
					return false;
				}
				// holding something that isn't a pan -> DO NOTHING
				if (!isPan(hand)) {
					return false;
				}
				// holding a pan -> DROP (pan)
				setInner(hand);
				setHand(null);
				console.log(header);
				console.log(`Put ${printItem(hand)} into the oven!`);
				return true;
			}

			// storage full...
			// holding nothing -> PICKUP (pan)
			if (hand === null) {
				setHand(inner);
				setInner(null);
				console.log(header);
				console.log(`Took ${printItem(inner)} out of the oven!`);
				return true;
			}
			// holding something -> DO NOTHING
			return false;
		},
	};
	return ret;
};
export const printOvenTile = (tile: OvenTile): string[] => {
	return [`Oven: ${tile.inside ? printItem(tile.inside) : '(empty)'}`];
};

// --------------------------------------- APPLIANCES -------------------------------- //

export const isApplianceTile = (v: unknown): v is ApplianceTile => (v as ApplianceTile)?.tile === 'appliance';
export type ApplianceTile = TileCommon & {
	tile: 'appliance';
	inside: (FoodComponent|Product)[];
	interact: (s: State) => boolean;
	pickup_or_drop: (s: State) => boolean;
}

// Can only contain food (no pans)
// Can contain more than 1 thing

const newApplianceTile = (type: string): ApplianceTile => {
	const ret: ApplianceTile = {
		tile: 'appliance',
		type,
		inside: [],
		interact: (s) => {
			// Avoiding typos:
			const inner = ret.inside;
			const setInner = (arr: (FoodComponent|Product)[]) => { ret.inside = arr; };

			// storage empty -> DO NOTHING
			if (inner.length === 0) {
				return false;
			}

			// otherwise...
			const eva = cookEval(type, inner);
			// not a real recipe -> DO NOTHING
			if (eva.errorCount > 0) {
				return false;
			}
			// otherwise -> MAKE IT
			const output = turnCookEvalIntoOutput(eva);
			setInner([output]);
			console.log(header);
			console.log(`Made ${printItem(output)} at the ${cleanString(type)}!`);
			return true;

		},
		pickup_or_drop: (s) => {
			// Avoiding typos:
			const hand = s.hand;
			const setHand = (v: Item | null) => { s.hand = v; }
			const inner = ret.inside;
			const setInner = (arr: (FoodComponent|Product)[]) => { ret.inside = arr; };

			//////// ----------- storage is multiple things!

			if (inner.length > 1) {

				//// holding nothing -> DO NOTHING (cannot separate once items are inside appliance)
				if (hand === null) {
					return false;
				}

				//// holding food -> DROP (1)
				if (isProduct(hand) || isFoodComponent(hand)) {
					const itemToDrop = {...hand, quantity: 1};
					const newHand = itemSubtract(hand, 1);
					setHand(newHand)
					addItemToList(itemToDrop, inner);
					console.log(header);
					console.log(`Put ${printItem(itemToDrop)} ${intoStrings[type] || 'into the appliance'}!`);
					return true;
				}

				//// holding a pan...
				const pan = hand;
				const setPan = (v: Product|FoodComponent|null) => {
					if (!isPan(s.hand)) { throw new Error ("UNREACHABLE") }
					s.hand.carrying = v;
				};
				// pan empty -> DO NOTHING
				if (pan.carrying === null) {
					return false;
				}
				// pan full -> DROP ALL (pan is now empty)
				addItemToList(pan.carrying, inner);
				setPan(null);
				console.log(header);
				console.log(`Put ${printItem(pan.carrying)} ${intoStrings[type] || 'into the appliance'}!`);
				return true;
				
			}

			//////// ----------- storage is one kind of thing only!

			if (inner.length === 1) {
				const thingInMixer = inner[0];

				//// holding nothing -> PICKUP ALL (appliance is now empty)
				if (hand === null) {
					s.hand = thingInMixer;
					setInner([]);
					console.log(header);
					console.log(`Picked up ${printItem(thingInMixer)} ${fromStrings[type] || 'from the appliance'}!`);
					return true;
				}
				
				//// holding food -> DROP (1)
				if (isProduct(hand) || isFoodComponent(hand)) {
					const itemToDrop = {...hand, quantity: 1};
					const newHand = itemSubtract(hand, 1);
					setHand(newHand);
					addItemToList(itemToDrop, ret.inside);
					console.log(header);
					console.log(`Put ${printItem(itemToDrop)} ${intoStrings[type] || 'into the appliance'}!`);
					return true;
				}

				//// holding a pan...
				const pan = hand;
				const setPan = (v: Product|FoodComponent|null) => {
					if (!isPan(s.hand)) { throw new Error ("UNREACHABLE") }
					s.hand.carrying = v;
				};
				// pan full -> DROP ALL (pan is now empty)
				if (pan.carrying !== null) {
					addItemToList(pan.carrying, ret.inside);
					setPan(null);
					console.log(header);
					console.log(`Put ${printItem(pan.carrying)} ${intoStrings[type] || 'into the appliance'}!`);
					return true;
				}
				// pan empty...
				// if pan cannot carry it -> DO NOTHING
				if (!panMayContain(pan.name, thingInMixer.name)) {
					return false;
				}
				// if pan can -> PICKUP (1)
				const item = {...thingInMixer, quantity: 1};
				setPan(item);
				const newThingInMixer = itemSubtract(thingInMixer);
				if (newThingInMixer === null) {
					setInner([]);
				} else {
					setInner([newThingInMixer]);
				}
				console.log(header);
				console.log(`Picked up ${printItem(item)} ${fromStrings[type] || 'from the appliance'}!`);
				return true;
			}

			//////// ----------- storage empty!

			//// holding nothing -> DO NOTHING
			if (hand === null) {
				return false;
			}

			//// holding food -> DROP (1)
			if (isProduct(hand) || isFoodComponent(hand)) {
				const itemToDrop = {...hand, quantity: 1};
				const newHand = itemSubtract(hand, 1)
				setHand(newHand);
				addItemToList(itemToDrop, ret.inside);
				console.log(header);
				console.log(`Put ${printItem(itemToDrop)} ${intoStrings[type] || 'into the appliance'}!`);
				return true;
			}

			//// holding a pan
			const pan = hand;
			const setPan = (v: Product|FoodComponent|null) => {
				if (!isPan(s.hand)) { throw new Error ("UNREACHABLE") }
				s.hand.carrying = v;
			};
			// pan empty -> DO NOTHING
			if (pan.carrying === null) {
				return false;
			}
			// pan full -> DROP ALL (pan is now empty)
			addItemToList(pan.carrying, ret.inside);
			setPan(null);
			console.log(header);
			console.log(`Put ${printItem(pan.carrying)} ${intoStrings[type] || 'into the appliance'}!`);
			return true;
		},
	};
	return ret;
};
export const printApplianceTile = (tile: ApplianceTile): string[] => {
	if (tile.inside.length === 0) {
		return [`${capitalizeAndClean(tile.tile)} ${cleanString(tile.type)}: (empty)`];
	} else if (tile.inside.length === 1) {
		return [`${capitalizeAndClean(tile.tile)} ${cleanString(tile.type)}: ${printItem(tile.inside[0])}`];
	} else {
		return [
			`${capitalizeAndClean(tile.tile)}:`,
			...tile.inside.map(v=>'    '+printItem(v)),
		];
	}
};

// --------------------------------------- DELIVERY ZONE -------------------------------- //

export const isDeliveryZoneTile = (v: unknown): v is DeliveryZoneTile => (v as DeliveryZoneTile)?.tile === 'delivery_zone';
export type DeliveryZoneTile = TileCommon & {
	tile: 'delivery_zone';
	interact: (s: State) => boolean;
	pickup_or_drop: (s: State) => boolean;
	deliver: (v: Item) => boolean;
}
const newDeliveryZoneTile = (type: string): DeliveryZoneTile => {
	const ret: DeliveryZoneTile = {
		tile: 'delivery_zone',
		type,
		interact: () => false,
		pickup_or_drop: (s) => {
			const hand = s.hand;
			const setHand = (v: Item | null) => { s.hand = v; }
			// holding nothing -> DO NOTHING
			if (hand === null) {
				return false;
			}
			// holding food -> DO NOTHING
			if (isFoodComponent(hand)) {
				return false;
			}
			// holding a product -> DELIVER
			if (isProduct(hand)) {
				ret.deliver(hand);
				setHand(null);
				console.log(header);
				console.log(`Dropped ${printItem(hand)} off to be sold!`);
				return true;
			}
			// holding a pan...
			const pan = hand;
			const setPan = (v: Product|FoodComponent|null) => {
				if (!isPan(s.hand)) { throw new Error ("UNREACHABLE") }
				s.hand.carrying = v;
			};
			// pan empty -> DO NOTHING
			if (pan.carrying === null) {
				return false;
			}
			// pan full...
			// pan carrying a food component -> DO NOTHING
			if (isFoodComponent(pan.carrying)) {
				return false;
			}
			// pan carrying a product -> DELIVER
			ret.deliver(pan.carrying);
			setPan(null);
			console.log(header);
			console.log(`Dropped ${printItem(pan.carrying)} off to be sold!`);
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
	return [`Delivery zone`];
};

// --------------------------------------- COUNTERTOP -------------------------------- //

export const isCountertopTile = (v: unknown): v is CountertopTile => (v as CountertopTile)?.tile === 'countertop';
export type CountertopTile = TileCommon & {
	tile: 'countertop';
	inside: Item | null;
	interact: (s: State) => boolean;
	pickup_or_drop: (s: State) => boolean;
}
const newCountertopTile = (type = ''): CountertopTile => {
	const ret: CountertopTile = {
		tile: 'countertop',
		type,
		inside: null,
		interact: () => false,
		pickup_or_drop: (s) => {
			// Avoiding typos:
			const hand = s.hand;
			const setHand = (v: Item | null) => { s.hand = v; }
			const inner = ret.inside;
			const setInner = (v: Item | null) => { ret.inside = v; }

			//////// ----------- storage empty!

			if (inner === null) {
				// holding nothing -> DO NOTHING
				if (hand === null) {
					return false;
				}
	
				// holding food -> DROP (1)
				if (isProduct(hand) || isFoodComponent(hand)) {
					const toDrop = {...hand, quantity: 1};
					const newHand = itemSubtract(hand, 1);
					setHand(newHand);
					setInner(toDrop);
					console.log(header);
					console.log(`Set ${printItem(toDrop)} down on the countertop!`);
					return true;
				}
	
				// holding a pan -> DROP PAN
				setInner(hand);
				setHand(null);
				console.log(header);
				console.log(`Set ${printItem(hand)} down on the countertop!`);
				return true;
			}

			//////// ----------- storage full!

			// holding nothing -> PICKUP (1)
			if (hand === null) {
				setHand(inner);
				setInner(null);
				console.log(header);
				console.log(`Picked up ${printItem(inner)} off the countertop!`);
				return true;
			}

			// holding food -> DO NOTHING
			if (isFoodComponent(hand)) {
				return false;
			}

			// holding a product -> DO NOTHING
			if (isProduct(hand)) {
				return false;
			}

			// holding a pan...
			const pan = hand;
			const setPan = (v: Product|FoodComponent|null) => {
				if (!isPan(s.hand)) { throw new Error ("UNREACHABLE") }
				s.hand.carrying = v;
			};

			// storage is itself a pan -> SWAP
			if (isPan(inner)) {
				const fromCountertop = inner;
				const fromHand = hand;
				setHand(fromCountertop);
				setInner(fromHand);
				console.log(header);
				console.log(`Swapped ${printItem(fromCountertop)} for ${printItem(fromHand)}!`);
				return true;
			}

			// your pan is empty...
			if (pan.carrying === null) {
				// item on counter can go on/in your pan -> PICKUP (1)
				if (panMayContain(pan.name, inner.name)) {
					const item = { ...inner, quantity: 1 };
					setPan(item);
					const newInside = itemSubtract(inner, 1)
					setInner(newInside);
					console.log(header);
					console.log(`Picked up ${printItem(item)} off the countertop!`);
					return true;
				}
				// otherwise -> DO NOTHING
				return false;
			}

			// your pan is full -> DO NOTHING
			return false;
		},
	}
	return ret;
};

const newCountertopTileWith = (contents: Item, type?: string): CountertopTile => {
	const tile = newCountertopTile(type);
	tile.inside = contents;
	return tile;
};
export const printCountertopTile = (tile: CountertopTile): string[] => {
	return [`Countertop: ${tile.inside ? printItem(tile.inside) : '(nothing)'}`];
};
