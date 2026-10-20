import { getItemInfo, newIngredient, newProduct } from "./items.ts";

import type { Tile } from "./tiles.ts";
import {
	errorLog,
	header,
	isCountertopTile,
	isDeliveryZoneTile,
	isOvenTile,
	isStorageTile,
	isTrashTile,
	log,
	newFilledStorageTile,
	newState,
	newTile,
	printTile
} from "./tiles.ts";

import type { Item } from "./utilities.ts";
import { isContainer, itemsCanStack, newPan, printModifiersWithItemName } from "./utilities.ts";

const s = newState([
	newTile('delivery_zone'),
	newTile('oven'),
	newTile('cutting_board'),
	newTile('mixer'),
	newTile('storage', newIngredient('flour', 20)),
	newTile('storage', newIngredient('sugar', 25)),
	newTile('storage', newIngredient('egg', 12)),
	newTile('storage', newIngredient('frosting', 5)),
	newTile('storage', newIngredient('frosting', 5, ['cocoa_powder'])),
	newTile('storage', newPan('cookie_sheet', 3)),
	newTile('storage', newPan('muffin_tin', 3)),
	newTile('storage', newPan('cake_pan', 3)),
	newTile('storage', newIngredient('rainbow_sprinkles', 5)),
	newTile('countertop'),
	newTile('countertop'),
	newTile('countertop'),
	newTile('countertop'),
	newTile('countertop'),
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	newTile('trash'),
]);

const setTile = (index: number, tile: Tile | null) => {
	s.tiles[index] = tile;
};
const swapTilesByIndices = (i: number, j: number) => {
	const iTile = s.tiles[i];
	const jTile = s.tiles[j];
	setTile(i, jTile);
	setTile(j, iTile);
};
const findEmptyWorkspaceIndex = (): number => {
	return s.tiles.findIndex(v=>isCountertopTile(v) && v.inside === null);
};
const simpleFindStorageTileWithName = (itemCode: string): number => {
	return s.tiles.findIndex(v=>{
		if (!isStorageTile(v)) { return false; }
		if (v.inside === null) { return false; }
		if (isContainer(v.inside)) {
			return itemCode === v.inside.name;
		}
		return itemCode === v.inside.name;
	});
};
const findStorageTileIndexThatStacksWith = (item: Item): number => {
	return s.tiles.findIndex(v=>{
		if (v === null) { return false; }
		if (!isStorageTile(v)) { return false; }
		if (v.inside === null) { return false; }
		return itemsCanStack(v.inside, item);
	});
};
const findFirstNullTileIndex = (): number => {
	return s.tiles.indexOf(null);
};
const findApplianceTileIndex = (type: string): number => {
	if (type === 'oven') {
		return s.tiles.findIndex(v=>isOvenTile(v));
	}
	return s.tiles.findIndex(v=>v?.tile === 'appliance' && v?.type === type);
};

const costTiers: Record<number, number> = {
	1: 10,
	2: 25,
	3: 50,
	4: 100,
	5: 500,
};

const getItemCost = (item: string): number => {
	const info = getItemInfo(item);
	if (info.cost === null) {
		// item is not for sale
		throw new Error(`Cannot buy any '${item}': not for sale`);
	}
	const goldCostSingle = costTiers[info.cost];
	return goldCostSingle;
};
const buy = (name: string, quantity = 10): boolean => {
	const goldCost = getItemCost(name);
	const totalCost = goldCost * quantity;
	if (totalCost > s.gold) {
		// you can't afford it
		errorLog(s, `Cannot afford to buy ${quantity}x '${name}': current gold: ${s.gold} (cost: ${totalCost}, ${goldCost} ea.)`);
		return false;
	}
	// FIND THE PLACE TO PUT IT
	const dummyItem = getItemInfo(name).categories.includes('product')
		? newProduct(name, quantity)
		: newIngredient(name, quantity);
	let tileIndex = findStorageTileIndexThatStacksWith(dummyItem);
	// a matching storage tile already exists
	if (tileIndex >= 0) {
		const tile = s.tiles[tileIndex];
		if (!isStorageTile(tile) || tile.inside === null) { throw new Error ("UNREACHABLE"); }
		tile.inside.quantity += quantity;
		s.gold -= totalCost;
		log(s, `Bought ${quantity}x '${name}' (new quantity: ${tile.inside.quantity})`);
		return true;
	}
	// storage tile does not exist, but there's space. buy it
	let nullTileIndex = findFirstNullTileIndex();
	if (nullTileIndex !== -1) {
		s.tiles[nullTileIndex] = newFilledStorageTile({ name, quantity, modifiers: [] });
		s.gold -= totalCost;
		log(s, `Bought ${quantity}x '${name}'`);
		return true;
	}
	// no more null tiles left to put the box! never mind
	const info = getItemInfo(name);
	errorLog(s, `Could not buy ${quantity}x '${name}': not enough space to put a new storage ${info.storageType}`);
	return false;
};
const goto = (destination: string | number, subtype?: string): boolean => {
	const moveAndLog = (newTileIndex: number) => {
		s.tile_index = newTileIndex;
		const tile = s.tiles[s.tile_index];
		if (tile === undefined) { return false; }
		log(s, `Moved to ${printTile(tile).join('\n')}`);
	}
	if (typeof destination === 'number') {
		if (destination >= s.tiles.length) {
			// out of bounds!
			errorLog(s, `Cannot go to location index ${destination}: out of bounds! (Max index: ${s.tiles.length -1})`);
			return false;
		} else if (destination < 0) {
			// out of bounds!
			errorLog(s, `Cannot go to location index ${destination}: out of bounds! (Index was less than 0? Why...?)`);
			return false;
		}
		moveAndLog(destination);
		return true;
	}
	if (destination === 'trash') {
		const tileIndex = s.tiles.findIndex(v=>isTrashTile(v));
		if (tileIndex === -1) { throw new Error ("SEOMTHING BOROKE ")}
		moveAndLog(tileIndex);
		return true;
	}
	if (destination === 'delivery') {
		const tileIndex = s.tiles.findIndex(v=>isDeliveryZoneTile(v));
		if (tileIndex === -1) { throw new Error ("SEOMTHING BOROKE ")}
		moveAndLog(tileIndex);
		return true;
	}
	if (destination === 'oven' || destination === 'mixer' || destination === 'cutting_board') {
		const tileIndex = findApplianceTileIndex(destination);
		if (tileIndex === -1) {
			if (subtype === undefined) {
				errorLog(s, `Could not find tile: '${destination}'`);
			} else {
				errorLog(s, `Could not find tile: '${destination}', '${subtype}'`);
			}
			return false;
		}
		moveAndLog(tileIndex);
		return true;
	}
	if (destination === 'storage' && subtype !== undefined) {
		const tileIndex = simpleFindStorageTileWithName(subtype);
		if (tileIndex == -1) {
			errorLog(s, `Could not find storage: '${destination}', '${subtype}'`);
			return false;
		}
		moveAndLog(tileIndex);
		return true;
	}
	if (destination === 'emptyCounter') {
		const tileIndex = findEmptyWorkspaceIndex();
		if (tileIndex === -1) {
			errorLog(s, `Could not find any empty counterspace`);
			return false;
		}
		moveAndLog(tileIndex);
		return true;
	}
	throw new Error (`NOT HANDLED: ${destination}, ${subtype}`);
}
const interact = (): boolean => {
	const tile = s.tiles[s.tile_index];
	if (tile === null || tile === undefined) { return false; }
	return tile.interact(s);
}
const pickupOrDrop = (): boolean => {
	const tile = s.tiles[s.tile_index];
	if (tile === null || tile === undefined) { return false; }
	return tile.pickup_or_drop(s);
}
const drop = pickupOrDrop;
const pickup = pickupOrDrop;

const glitteringPrizes = (increase = 100_000) => {
	s.gold += increase;
	log(s, `How strange! ${increase} gold was added to your account!`);
}

const tiles = () => {
	const toPrint = s.tiles.map((v, i)=>{
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
	// console.log(`empty ('oven'|'mixer'|'cutting_board') [discards entire contents, if any]`);
	// console.log(`attributes (location, index?) [index defaults to 0]`)
	// console.log(`addFilling () [uses finisher: filling]`);
	console.log(`======================== Commands ========================`);
	console.log(`> fetch (itemName, quantity?: number [1])`)
	console.log(`    Grabs X of the item from storage and returns you to where you just were`)
	console.log(`    If not in storage, buys it; if you can't afford it, cheats until you can`)
	console.log(`> fetchAndDrop (itemName, quantity?: number [1])`)
	console.log(`    Same as the above but also drops it`)
};
const fetchAndDrop = (itemName: string, quantity = 1) => {
	fetch(itemName, quantity);
	drop()
}
const fetch = (itemName: string, quantity = 1) => {
	const whereYouJustWere = s.tile_index;
	let index = simpleFindStorageTileWithName(itemName);
	const costForOne = getItemCost(itemName);
	if (index === -1) {
		// CHEATY FOR NOW
		if (s.gold < quantity * costForOne * 10) {
			glitteringPrizes();
		}
		buy(itemName, 10);
		index = simpleFindStorageTileWithName(itemName);
	}
	goto('storage', itemName);
	pickup();
	goto(whereYouJustWere)
}

tiles()
goto('mixer')
fetchAndDrop('sugar')
fetchAndDrop('flour')
interact();

fetchAndDrop('mint_flavoring')
fetchAndDrop('mint_flavoring')
fetchAndDrop('mint_flavoring')
fetchAndDrop('mint_flavoring')
fetchAndDrop('mint_flavoring')
interact()
fetch('cookie_sheet')
pickup()

// BAKE
goto('oven')
drop()
interact()
pickup()

// set on countertop
goto(17) // definitely empty counter
drop()

// apply frosting
fetch('frosting')
interact()

// apply sprinkles
fetch('rainbow_sprinkles')
interact()
pickup()

// deliver
goto(0)
interact()

console.log("BREAKPOINT ME")