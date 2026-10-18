import { getItemInfo, newFoodComponent, newProduct } from "./items.ts";

import type { StorageTile, Tile } from "./tiles.ts";
import {
	header,
	isCountertopTile,
	isOvenTile,
	isStorageTile,
	itemAdd,
	newFilledStorageTile,
	newState,
	printTile
} from "./tiles.ts";

import type { Item } from "./utilities.ts";
import { itemsCanStack, printItem, printModifiersWithItemName } from "./utilities.ts";

const state = newState();

const setTile = (index: number, tile: Tile | null) => {
	state.tiles[index] = tile;
};
const swapTilesByIndices = (i: number, j: number) => {
	const iTile = state.tiles[i];
	const jTile = state.tiles[j];
	setTile(i, jTile);
	setTile(j, iTile);
};
const findEmptyWorkspaceIndex = (): number => {
	return state.tiles.findIndex(v=>isCountertopTile(v) && v.inside === null);
};
const findStorageTileWithName = (printName: string): number => {
	return state.tiles.findIndex(v=>{
		if (!isStorageTile(v)) { return false; }
		if (v.inside === null) { return false; }
		return printName === printModifiersWithItemName(v.inside.name, v.inside.modifiers);
	});
};
const findStorageTileIndexThatStacksWith = (item: Item): number => {
	return state.tiles.findIndex(v=>{
		if (v === null) { return false; }
		if (!isStorageTile(v)) { return false; }
		if (v.inside === null) { return false; }
		return itemsCanStack(v.inside, item);
	});
};
const findFirstNullTileIndex = (): number => {
	return state.tiles.indexOf(null);
};
const findApplianceTileIndex = (type: string): number => {
	if (type === 'oven') {
		return state.tiles.findIndex(v=>isOvenTile(v));
	}
	return state.tiles.findIndex(v=>v?.tile === 'appliance' && v?.type === type);
};

const help = () => {
	console.log(header);
	console.log(`======================== Commands ========================`);
	console.log(`> interact ()`)
	console.log(`    Interacts with the appliance at the current location.`)
	console.log(`> pickupOrDrop ()`)
	console.log(`    Drops or picks up an item. Context (i.e. location) dependent.`)
	console.log(`    Aliases: pickup(), drop()`)
	console.log(`> goto (destination: string|number, subtype: string)`)
	console.log(`    Set location to the tile at the given index, e.g. goto(4)`)
	console.log(`    or find a tile with strings, e.g. goto('oven') or goto('storage', 'flour')`)
	console.log(`> buy (itemName: string, quantity?: number [10])`)
	console.log(`    Buy from the warehouse; refills existing storage, or adds a new storage tile to a null tile`)

	// TODO WIP: a means to buy an empty storage container
	// Then also adding finishers again
	// Then getting money from selling things

	// console.log(`empty ('oven'|'mixer'|'cutting_board') [discards entire contents, if any]`);
	// console.log(`discard (location, index) [removes and discards item, if any]`);
	// console.log(`attributes (location, index?) [index defaults to 0]`)
	// console.log(`addFilling () [uses finisher: filling]`);
	// console.log(`addDecoration () [uses finisher: decoration]`);
	// console.log(`addDoodad () [uses finisher: doodad]`);
};

const costTiers: Record<number, number> = {
	1: 10,
	2: 25,
	3: 50,
	4: 100,
	5: 500,
};
const buy = (name: string, quantity = 10): boolean => {
	const info = getItemInfo(name);
	if (info.cost === null) {
		// item is not for sale
		console.error(header);
		console.error(`Cannot buy any '${name}': not for sale`);
		return false;
	}
	const goldCost = costTiers[info.cost];
	const totalCost = goldCost * quantity;
	if (totalCost > state.gold) {
		// you can't afford it
		console.error(header);
		console.error(`Cannot afford to buy ${quantity}x '${name}': current gold: ${state.gold} (cost: ${totalCost}, ${goldCost} ea.)`);
		return false;
	}
	// FIND THE PLACE TO PUT IT
	const dummyItem = getItemInfo(name).categories.includes('product')
		? newProduct(name, quantity)
		: newFoodComponent(name, quantity);
	let tileIndex = findStorageTileIndexThatStacksWith(dummyItem);
	// a matching storage tile already exists
	if (tileIndex >= 0) {
		const tile = state.tiles[tileIndex];
		if (!isStorageTile(tile) || tile.inside === null) { throw new Error ("UNREACHABLE"); }
		itemAdd(tile.inside, quantity);
		state.gold -= totalCost;
		console.log(header);
		console.log(`Bought ${quantity}x '${name}' (new quantity: ${tile.inside.quantity})`);
		return true;
	}
	// storage tile does not exist, but there's space. buy it
	let nullTileIndex = findFirstNullTileIndex();
	if (nullTileIndex !== -1) {
		state.tiles[nullTileIndex] = newFilledStorageTile({ name, quantity, modifiers: [] });
		state.gold -= totalCost;
		console.log(header);
		console.log(`Bought ${quantity}x '${name}'`);
		return true;
	}
	// no more null tiles left to put the box! never mind
	console.error(header);
	console.error(`Could not buy ${quantity}x '${name}': not enough space to put a new storage ${info.storageType}`);
	return false;
};
const goto = (destination: string | number, subtype?: string): boolean => {
	const printMoved = () => {
		const tile = state.tiles[state.location_index];
		if (tile === undefined) { return false; }
		console.log(header);
		console.log(`Moved to location index ${state.location_index}: ${printTile(tile).join('\n')}`);
	}
	if (typeof destination === 'number') {
		if (state.tiles.length >= destination) {
			// out of bounds!
			console.error(header);
			console.error(`Cannot go to location index ${state.location_index}: out of bounds! (Max index: ${state.tiles.length -1})`);
			return false;
		} else if (state.tiles.length < 0) {
			// out of bounds!
			console.error(header);
			console.error(`Cannot go to location index ${state.location_index}: out of bounds! (Index was less than 0? Why...?)`);
			return false;
		}
		state.location_index = destination;
		printMoved();
		return true;
	}
	if (destination === 'oven' || destination === 'mixer' || destination === 'cutting_board') {
		const tileIndex = findApplianceTileIndex(destination);
		if (tileIndex === -1) {
			console.error(header);
			if (subtype === undefined) {
				console.error(`Could not find tile: '${destination}'`);
			} else {
				console.error(`Could not find tile: '${destination}', '${subtype}'`);
			}
			return false;
		}
		state.location_index = tileIndex;
		printMoved();
		return true;
	}
	if (destination === 'storage' && subtype !== undefined) {
		const tileIndex = findStorageTileWithName(subtype);
		if (tileIndex == -1) {
			console.error(header);
			console.error(`Could not find storage: '${destination}', '${subtype}'`);
			return false;
		}
		state.location_index = tileIndex;
		printMoved();
		return true;
	}
	if (destination === 'emptyCounter') {
		const tileIndex = findEmptyWorkspaceIndex();
		if (tileIndex === -1) {
			console.error(header);
			console.error(`Could not find any empty counterspace`);
			return false;
		}
		state.location_index = tileIndex;
		printMoved();
		return true;
	}
	throw new Error (`NOT HANDLED: ${destination}, ${subtype}`);
}
const interact = (): boolean => {
	const tile = state.tiles[state.location_index];
	if (tile === null || tile === undefined) { return false; }
	return tile.interact(state);
}
const pickupOrDrop = (): boolean => {
	const tile = state.tiles[state.location_index];
	if (tile === null || tile === undefined) { return false; }
	return tile.pickup_or_drop(state);
}
const drop = pickupOrDrop;
const pickup = pickupOrDrop;

const glitteringPrizes = (increase = 100_000) => {
	state.gold += increase;
	console.log(header);
	console.log(`How strange! ${increase} gold was added to your account!`);
}

const tiles = () => {
	const toPrint = state.tiles.map((v, i)=>{
		const alignedIndex = i < 10 ? ` ${i}` : i;
		const ret = printTile(v).map((v, j)=>{
			if (j === 0) {
				return `  ${alignedIndex}. ${v}`;
			} else {
				return `    - ${v}`;
			}
		}).join('\n');
		return ret;
	}).join('\n');
	console.log(`LOCATION TILES:`)
	console.log(toPrint);
}

tiles()
goto('storage', 'sugar');
pickup();
goto('mixer');
drop();
goto('storage', 'flour')
pickup();
goto('mixer');
interact();

console.log("BREAKPOINT ME")