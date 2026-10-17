import type { FinishedProduct } from "./finishers.ts"
import {
	finishedProductMatchIgnoringQuantity,
	prettyPrintFinishedProduct,
	printGenericIngredientUnit
} from "./finishers.ts"
import { getItemInfo } from "./items.ts";

import { cookEval, turnCookEvalIntoOutput } from "./main.ts";

import type { IngredientUnit } from "./utilities.ts"
import { capitalizeFirstLetter, ingredientUnitsMatchIgnoringQuantity, isIngredientUnit } from "./utilities.ts"

const debug = true;
const debugPrint = (s: string) => {
	if (debug) {
		console.log(s)
	}
}

// -------------------------------------------- STATE -------------------------------------------- //

type Item = IngredientUnit | FinishedProduct;
const itemTypesMatch = (a: Item, b: Item): boolean => isIngredientUnit(a) === isIngredientUnit(b);
const itemsMatchIgnoringQuantity = (a: Item, b: Item): boolean => {
	if (!itemTypesMatch(a, b)) {
		return false;
	}
	if (isIngredientUnit(a) && isIngredientUnit(b)) {
		return ingredientUnitsMatchIgnoringQuantity(a, b);
	} else if (!isIngredientUnit(a) && !isIngredientUnit(b)) {
		return finishedProductMatchIgnoringQuantity(a, b)
	}
	return false;
}

type CookLocation = 'oven' | 'mixer' | 'cutting_board';
const isCookLocation = (v: unknown): v is CookLocation => {
	if (v === 'oven') { return true; }
	if (v === 'mixer') { return true; }
	if (v === 'cutting_board') { return true; }
	return false;
};

type OtherLocation = 'hand' | 'countertop' | 'decorating_stand' | 'display_case' | 'storage';
const isOtherLocation = (v: unknown): v is OtherLocation => {
	if (v === 'hand') { return true; }
	if (v === 'countertop') { return true; }
	if (v === 'display_case') { return true; }
	if (v === 'storage') { return true; }
	return false;
};

type Location = OtherLocation | CookLocation;
const isLocation = (v: unknown): v is Location => isOtherLocation(v) || isCookLocation(v);

const intoStrings: Record<Location, string> = {
	oven: `into the oven`,
	mixer: `into the mixer`,
	cutting_board: `onto the cutting board`,
	hand: `into your hands`,
	decorating_stand: `onto the decorating stand`,
	display_case: `into the display case`,
	countertop: `onto the countertop`,
	storage: `into storage`,
}
const fromStrings: Record<Location, string> = {
	oven: `from the oven`,
	mixer: `from the mixer`,
	cutting_board: `from the cutting board`,
	hand: `from your hands`,
	decorating_stand: `from the decorating stand`,
	display_case: `from the display case`,
	countertop: `from the countertop`,
	storage: `from storage`,
}

type State = {
	gold: number;
	locations: {
		storage: Item[];
		oven: Item[];
		mixer: Item[];
		cutting_board: Item[];
		hand: Item | null;
		countertop: Item[];
		decorating_stand: Item[];
		display_case: FinishedProduct[];
	}
};

const state: State = {
	gold: 100,
	locations: {
		hand: null,
		storage: [
			{ item: 'flour', quantity: 100, modifiers: [] },
			{ item: 'sugar', quantity: 100, modifiers: [] },
			{ item: 'orange_flavoring', quantity: 10_000, modifiers: [] },
			{ item: 'frosting', quantity: 20, modifiers: [] },
			{ item: 'frosting', quantity: 20, modifiers: ['cocoa_powder'] },
		],
		oven: [],
		mixer: [],
		cutting_board: [],
		decorating_stand: [],
		countertop: [],
		display_case: [],
	},
};

// -------------------------------------------- INVENTORY MANAGEMENT -------------------------------------------- //

// Returns the item removed, or false if nothing was removed
// Note: If asked to remove a greater quantity than available, will remove all
const removeItemFromItemList = (itemToRemove: Item, arr: Item[]): Item | false => {
	const i = arr.findIndex((v)=>itemsMatchIgnoringQuantity(itemToRemove, v));
	if (i === -1) {
		// Not there to remove? It broke
		return false;
	}
	const item = arr[i];
	// If we want to remove more than is there, take it all.
	if (item.quantity <= itemToRemove.quantity) {
		// Remove it from the list
		arr.splice(i, 1);
		return item;
	}
	// Otherwise, there'll be some left
	item.quantity -= itemToRemove.quantity;
	return itemToRemove;
}
const removeItemFromLocation = (itemToRemove: Item, location: Location): Item | false => {
	if (location !== 'hand') {
		return removeItemFromItemList(itemToRemove, state.locations[location]);
	}
	// Can't remove what's not there
	if (state.locations.hand === null) {
		debugPrint(`removeFromLocation: Hand is already empty`);
		return false;
	}
	// If it's there, we can remove it
	const whatsInHand = state.locations.hand;
	state.locations.hand = null;
	return whatsInHand;
};

// Returns the new item object
// Object returned might have greater quantity than provided if some where there already
const addItemToItemList = (itemToAdd: Item, arr: Item[]): Item => {
	const foundIndex = arr.findIndex((v)=>itemsMatchIgnoringQuantity(itemToAdd, v));
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
const addItemToLocation = (itemToAdd: Item, location: Location): Item | false => {
	if (location !== 'hand') {
		return addItemToItemList(itemToAdd, state.locations[location])
	}
	// IT WAS HAND
	// Hand was empty? It's not anymore
	if (state.locations.hand === null) {
		state.locations.hand = itemToAdd;
		return itemToAdd;
	}
	// Hand contains the same stuff? Add the quantities
	if (itemsMatchIgnoringQuantity(state.locations.hand, itemToAdd)) {
		state.locations.hand.quantity += itemToAdd.quantity;
		return state.locations.hand;
	}
	// Otherwise it broke
	debugPrint(`addToLocation: Hand already contains something`);
	return false;
};

// Returns whether a change happened.
const empty = (cookLocation: CookLocation): boolean => {
	const items = state.locations[cookLocation];
	if (items.length === 0) {
		console.warn(header)
		console.warn(`There are no items at ${cookLocation} to discard.`)
		return false;
	}
	console.log(header)
	console.log(`Emptying the ${cookLocation}! Discarding:`)
	console.log(printItemList(items));
	state.locations[cookLocation] = [];
	return true;
}

// Returns whether it happened
const pickup = (location: Location, index = 0, givenQuantity?: number): boolean => {
	if (location === 'hand') {
		console.warn(header);
		console.warn(`You cannot pick up something from your own hands!`);
		return false;
	}
	if (state.locations.hand !== null) {
		console.warn(header);
		console.warn(`Your hands are already full. (Carrying: ${printItem(state.locations.hand)})`);
		return false;
	}
	const existingItem = state.locations[location][index];
	if (existingItem === undefined) {
		console.error(header);
		console.error(`There is nothing ${intoStrings[location]}.`);
		return false;
	}

	// Appliances: items can only be picked up after being combined
	// (e.g. in the mixer, you cannot remove just the flour if there's also sugar!).
	if (isCookLocation(location)) {
		if (state.locations[location].length > 1) {
			console.warn(header);
			console.warn(`There are multiple items here, and they cannot be removed individually. Combine them first, or empty the container into the trash.`);
			return false;
		}
	}
	const itemToRemove = {...existingItem};
	const quantity = givenQuantity !== undefined
		? givenQuantity
		: isCookLocation(location)
			? itemToRemove.quantity
			: 1;
	itemToRemove.quantity = quantity;

	const removed = removeItemFromLocation(itemToRemove, location);
	if (removed === false) {
		return false;
	}
	state.locations.hand = removed;
	console.log(header);
	console.log(`You picked up '${printItem(state.locations.hand)}' ${fromStrings[location]}.`)
	return true;
};

// Returns whether it happened
const drop = (destination: Location): boolean => {
	if (destination === 'hand') {
		console.warn(header);
		console.warn(`You cannot drop something into your own hands!`);
		return false;
	}
	if (state.locations.hand === null) {
		console.warn(header);
		console.warn(`You are not carrying anything to drop.`);
		return false;
	}
	const inHand = state.locations.hand;
	const result = addItemToLocation(inHand, destination);
	if (result !== false) {
		state.locations.hand = null;
		console.log(header);
		console.log(`You put '${printItem(inHand)}' ${intoStrings[destination]}.`)
		console.log(`${capitalizeFirstLetter(destination.replace(/_/g, ' '))} now contains:`)
		console.log(printItemList(state.locations[destination]));
	}
	return result !== false;
};

// Returns quantity purchased
const buy = (item: string, quantity = 100): number => {
	const itemInfo = getItemInfo(item);
	const cost = (itemInfo.cost || 0) * 100;
	if (cost === 0) {
		console.warn(header);
		console.warn(`You cannot purchase '${item}'`);
		return 0;
	}
	if (cost > state.gold) {
		console.warn(header);
		console.warn(`You cannot afford ${quantity}x '${item}'`);
		return 0;
	}
	state.gold -= cost;
	const toAdd: IngredientUnit = { item, quantity, modifiers: [] };
	const newItemInfo = addItemToLocation(toAdd, 'storage');
	if (!newItemInfo) {
		throw new Error ('should be unreachable')
	}
	return newItemInfo.quantity;
};
// Cheaty
const glitteringPrizes = (increase = 100_000) => {
	state.gold += increase;
	console.log(header);
	console.log(`How strange! ${increase} gold was added to your account!`);
} 

// -------------------------------------------- PRINTING -------------------------------------------- //

const header = `-----------------------------------------------------------------`;
const printItem = (item: Item): string => {
	if (isIngredientUnit(item)) {
		return printGenericIngredientUnit(item)
	} else {
		return prettyPrintFinishedProduct(item);
	}
}

const printItemList = (arr: Item[]): string => {
	let hadSomething = false;
	const result: string[] = [];
	arr.forEach((item, i)=>{
		hadSomething = true;
		result.push(`  ${i}. ${printItem(item)}`);
	});
	if (!hadSomething) {
		result.push(`  (nothing)`);
	}
	return result.join('\n')
}

// -------------------------------------------- ACTIONS -------------------------------------------- //

const help = () => {
	console.log(header);
	console.log(`======= Locations =======`);
	console.log(`'hand', 'storage', 'oven', 'mixer', 'cutting_board', 'countertop', 'display_case'`);
	console.log(`======= Commands =======`);
	console.log(`inventory (location?) [if location is not provided, shows everything]`);
	console.log(`pickup (location, index, quantity?) [defaults to 1]`);
	console.log(`drop (location)`);
	console.log(`use ('oven'|'mixer'|'cutting_board')`);
	console.log(`empty ('oven'|'mixer'|'cutting_board') [discards contents, if any]`);
	console.log(`buy (itemName, quantity?)`);
}

const inventory = (location?: Location, suppressHeader?: boolean): void => {
	if (!suppressHeader) {
		console.log(header);
	}
	if (location === undefined) {
		console.log('>>> INVENTORY:')
		console.log(`Your gold: ${state.gold}`)
		inventory('hand', true);
		inventory('storage', true);
		inventory('cutting_board', true);
		inventory('mixer', true);
		inventory('oven', true);
		inventory('countertop', true);
		inventory('decorating_stand', true);
		inventory('display_case', true);
		return;
	}
	if (!isLocation(location)) {
		console.error(`There is no location called ${location}`);
	}
	if (location !== 'hand') {
		console.log(`${capitalizeFirstLetter(location.replace(/_/g, ' '))} contains:`);
		console.log(printItemList(state.locations[location]));
		return;
	}
	if (state.locations.hand === null) {
		console.log(`You are not holding anything.`);
	} else {
		console.log(`You are holding: ${printItem(state.locations.hand)}`);
	}
};

const use = (cookLocation: CookLocation): boolean => {
	if (!isCookLocation(cookLocation)) {
		console.error(header);
		console.error(`${cookLocation} is not a valid kitchen location`);
		return false;
	}

	const items = state.locations[cookLocation];
	
	// If any are finished products, don't go through with it
	const ingredients = items.filter(isIngredientUnit);
	const finishedProducts = items.filter(v=>!isIngredientUnit(v));
	if (finishedProducts.length) {
		console.error(header);
		console.error(`${cookLocation}: some of these items are products, not ingredients:`);
		console.error(printItemList(finishedProducts));
		return false;
	}
	// See if there is a recipe that satisfies everything
	const eva = cookEval(cookLocation, ingredients);
	if (eva.errorCount > 0) {
		console.error(header);
		console.error(`${cookLocation}: could not make anything normal with these ingredients:`);
		console.error(printItemList(ingredients));
		return false;
	}
	// Guess it worked
	const product = turnCookEvalIntoOutput(eva);
	state.locations[cookLocation] = [product];
	console.log(header)
	console.log(`You used the ${cookLocation.replace(/_/g, ' ')}! Made '${printItem(product)}'!`)
	// console.log(`Ingredients used:`)
	// console.log(printItemList(ingredients));
	return true;
}

// Staring out:
inventory();

// Cheeky!
glitteringPrizes();
buy('cocoa_powder', 100)

// Double chocolate cookie dough
pickup('storage', 0); // flour
drop('mixer');
pickup('storage', 1); // sugar
drop('mixer');
use('mixer'); // made cookie dough
pickup('storage', 5); // cocoa powder
drop('mixer');
use('mixer'); // made chocolate cookie dough
pickup('storage', 5);
drop('mixer');
use('mixer'); // made double chocolate cookie dough
pickup('mixer');

// Bake cookies
drop('oven');
use('oven');
pickup('oven');
drop('countertop') // dropping cookies off

// Double chocolate frosting
inventory();
pickup('storage', 1); // sugar
drop('mixer');
pickup('storage', 5); // cocoa powder
drop('mixer');
buy('mint_flavoring', 100)
pickup('storage', 6); // mint flavoring
drop('mixer');
use('mixer');
pickup('mixer')
drop('countertop');

inventory();
console.log('BREAKPOINT ME TO PLAY')