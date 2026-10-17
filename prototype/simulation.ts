import type { ProductFinisherType } from "./finishers.ts"
import {
	addFinisherToProduct,
	isFinisherAllowedOnProduct,
} from "./finishers.ts"
import { getItemInfo } from "./items.ts";

import type { Pan } from "./recipes.ts";

import {
	cookEval,
	getAttributesForIngredientUnit,
	getAttributeSpreadForFinishedProduct,
	turnCookEvalIntoOutput
} from "./main.ts";

import type { FinishedProduct, IngredientUnit, Item } from "./utilities.ts"
import {
	capitalizeFirstLetter,
	getItemName,
	isIngredientUnit,
	itemsMatchIgnoringQuantity,
	prettyPrintFinishedProduct,
	printGenericIngredientUnit,
	sortAndStringifyArray
} from "./utilities.ts"

import { isAttribute, type AttributeMap, type AttributeSpread } from "./attributes.ts";

const debug = true;
const debugPrint = (s: string) => {
	if (debug) {
		console.log(s)
	}
}

// -------------------------------------------- STATE -------------------------------------------- //

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
	if (v === 'decorating_stand') { return true; }
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
export const addItemToItemList = (itemToAdd: Item, arr: Item[]): Item => {
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

const printAttributes = (attributes: AttributeMap | AttributeSpread): string => {
	return Object.entries(attributes).map(([k,v])=>{
		if (!isAttribute(k)) { throw new Error ("UNREACHABLE") }
		return `  ${k}: ${JSON.stringify(v)}`;
	}).join('\n')
};

// -------------------------------------------- ACTIONS -------------------------------------------- //

const help = () => {
	console.log(header);
	console.log(`=============== Locations ===============`);
	console.log(`'hand', 'storage', 'oven', 'mixer', 'cutting_board', 'countertop', 'display_case'`);
	console.log(`=============== Commands ===============`);
	console.log(`inventory (location?) [if location is not provided, shows everything]`);
	console.log(`pickup (location, index?, quantity?) [index defautls to 0; quantity defaults to 1]`);
	console.log(`drop (location)`);
	console.log(`use ('oven'|'mixer'|'cutting_board', ('cookie_sheet'|'muffin_tin'|'cake_pan')?)`);
	console.log(`addFinisher ('filling'|'decoration'"|'doodad', location, index?)`)
	console.log(`empty ('oven'|'mixer'|'cutting_board') [discards contents, if any]`);
	console.log(`buy (itemName, quantity?) [buy from the warehouse]`);
	console.log(`attributes (location, index?) [index defaults to 0]`)
	console.log(`=============== Shortcuts ===============`);
	console.log(`dropUsePickup ('oven'|'mixer'|'cutting_board') [chains drop(), use(CookLocation), pickup(), unless something breaks along the way]`);
	console.log(`bakeCookies () [auto uses oven with cookie sheet]`);
	console.log(`bakeCupcakes () [auto uses oven with muffin tin]`);
	console.log(`bakeCake () [auto uses oven with cake pan]`);
	console.log(`addFilling () [auto uses finisher: filling]`);
	console.log(`addDecoration () [auto uses finisher: decoration]`);
	console.log(`addDoodad () [auto uses finisher: doodad]`);
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

const waitTimes: Record<number, string> = {
	0: "no time at all",
	1: "a moment",
	2: "a few minutes",
	3: "a while",
	4: "a long time",
	5: "a really long time",
}

const bakeCookies = () => use('oven', 'cookie_sheet');
const bakeCupcakes = () => use('oven', 'muffin_tin');
const bakeCake = () => use('oven', 'cake_pan');
const use = (location: CookLocation, bakeWith?: Pan): boolean => {
	if (!isCookLocation(location)) {
		console.error(header);
		console.error(`${location} is not a valid kitchen location`);
		return false;
	}

	const items = state.locations[location];
	
	// If any are finished products, don't go through with it
	const ingredients = items.filter(isIngredientUnit);
	const finishedProducts = items.filter(v=>!isIngredientUnit(v));
	if (finishedProducts.length) {
		console.error(header);
		console.error(`${location}: some of these items are products, not ingredients:`);
		console.error(printItemList(finishedProducts));
		return false;
	}
	// See if there is a recipe that satisfies everything
	const eva = cookEval(location, ingredients, bakeWith);
	const issues: string[] = [];
	if (!eva.bakeWithSatisfied) {
		const recipe = eva.recipeAttempted;
		if (bakeWith === undefined) {
			issues.push(`Bake needed '${recipe.bakeWith}', found nothing`);
		} else if (recipe.bakeWith === undefined) {
			issues.push(`'${bakeWith}' is not used to make '${recipe.output}'`);
		} else {
			issues.push(`Bake needed '${recipe.bakeWith}', found '${bakeWith}'`);
		}
	}
	if (eva.extraneousIngredients.length > 0) {
		issues.push(`Found extraneous ingredients: ${printItemList(eva.extraneousIngredients)}`)
	}
	if (eva.missingIngredients.length > 0) {
		issues.push(`Some ingredients were missing: ${sortAndStringifyArray(eva.missingIngredients)}`);
	}
	if (issues.length > 0) {
		console.error(header);
		console.error(`${location}: there were issues with the attempt to make '${eva.output}'`);
		console.error(issues.join('\n'));
		return false;
	}
	// Guess it worked
	const product = turnCookEvalIntoOutput(eva);
	state.locations[location] = [product];
	console.log(header)
	if (bakeWith !== undefined) {
		console.log(`You put the ${bakeWith.replace(/_/g, ' ')} ${intoStrings[location]} and waited ${waitTimes[eva.recipeAttempted.time]}. Made '${printItem(product)}'!`)
	} else {
		console.log(`You used the ${location.replace(/_/g, ' ')} and waited ${waitTimes[eva.recipeAttempted.time]}. Made '${printItem(product)}'!`)
	}
	return true;
}

// Finishers are applied 1x item per batch. Cookies are 12, cupcakes 6, cakes 1. E.g. 12x cookies use 1x frosting, 24x cookies use 2x frosting.
// Btw, stacks can only be the normal stack size in the back of the room, at least until they are put in the sales counter. Customers buying stuff can buy single units if they want: e.g. 2x cookies
// Finishers (carried in your hand) can be applied to items on the countertop or items on the decorating stand, but the latter will be applied faster.
// There must be enough finisher quanitity for the entire count of the stack on the counter tile (or decorating stand) or it will fail.

// Returns false if the decoration failed. Returns the new product otherwise.
const addFinisher = (finisherType: ProductFinisherType, location: Location, index = 0): FinishedProduct | false => {
	const plural = finisherType === 'filling' ? 'filling' : finisherType + 's';
	const indefiniteArticle = finisherType === 'decoration' ? 'decoration' : 'a ' + finisherType;
	if (location === 'hand') {
		console.warn(header);
		console.warn(`You cannot add ${plural} to something you are holding! First set the product on the countertop or on the decoration stand.`);
		return false;
	}
	const inHand = state.locations.hand;
	if (inHand === null) {
		console.warn(header);
		console.warn(`Cannot add ${plural}; you are not carrying anything`);
		return false;
	}
	const existingItem = state.locations[location][index];
	if (existingItem === undefined) {
		console.warn(header);
		console.warn(`There is nothing to add ${plural} to there.`);
		return false;
	}
	if (isIngredientUnit(existingItem)) {
		console.warn(header);
		console.warn(`Cannot add ${plural} to '${printItem(existingItem)}' (not a finished product).`);
		return false;
	}
	if (!isIngredientUnit(inHand)) {
		console.warn(header);
		console.warn(`Cannot add ${plural} using finished product '${printItem(inHand)}'.`);
		return false;
	}
	if (!isFinisherAllowedOnProduct(getItemName(inHand), finisherType, existingItem.product)) {
		console.warn(header);
		console.warn(`'${getItemName(inHand)}' cannot be used as ${indefiniteArticle} for '${existingItem.product}'.`);
		return false;
	}
	const newProduct = addFinisherToProduct(finisherType, inHand, existingItem);
	if (newProduct === null) {
		throw new Error ("UNREACHABLE");
	}
	console.log(header);
	if (finisherType === 'filling') {
		console.log(`Filled '${printItem(existingItem)}' with '${printItem(inHand)}'!`);
	} else if (finisherType === 'decoration') {
		console.log(`Decorated '${printItem(existingItem)}' with '${printItem(inHand)}'!`);
	} else if (finisherType === 'doodad') {
		console.log(`Added '${printItem(inHand)}' to the top of '${printItem(existingItem)}'!`);
	}
	console.log(`Now we have '${printItem(newProduct)}'!`)
	// adding a finisher modifies the thing in your hand :/
	if (state.locations.hand === null || state.locations.hand.quantity === 0) {
		state.locations.hand = null;
		console.log(`Now you are holding nothing.`)
	} else {
		console.log(`Now you are holding '${printItem(state.locations.hand)}'.`)
	}
	state.locations[location][index] = newProduct;
	return newProduct;
}
const addFilling = (location: Location, index = 0): FinishedProduct | false => addFinisher('filling', location, index);
const addDecoration = (location: Location, index = 0): FinishedProduct | false => addFinisher('decoration', location, index);
const addDoodad = (location: Location, index = 0): FinishedProduct | false => addFinisher('doodad', location, index);

const dropUsePickup = (cookLocation: CookLocation, bakeWith?: Pan): boolean => {
	const dropped = drop(cookLocation);
	if (!dropped) {
		return false;
	}
	const used = use(cookLocation, bakeWith);
	if (!used) {
		return false;
	}
	const pickuped = pickup(cookLocation);
	if (!pickuped) {
		return false;
	}
	return true;
}

const attributes = (location: Location, index = 0): void => {
	const existingItem = location === 'hand'
		? state.locations.hand
		: state.locations[location][index];
	if (!existingItem) {
		console.error(header);
		console.error(`There is nothing in '${intoStrings[location]}'.`);
		return;
	}
	const attributes = isIngredientUnit(existingItem)
		? getAttributesForIngredientUnit(existingItem)
		: getAttributeSpreadForFinishedProduct(existingItem);
	console.log(`Attributes for '${printItem(existingItem)}':`);
	console.log(printAttributes(attributes));
}

// Staring out:
inventory();

// Cheeky!
glitteringPrizes();
buy('cocoa_powder', 100)

pickup('storage', 0); // flour
drop('mixer');
pickup('storage', 1); // sugar
drop('mixer');
use('mixer'); // made cookie dough
pickup('storage', 5); // cocoa powder
drop('mixer');
use('mixer'); // made chocolate cookie dough
pickup('storage', 5);
dropUsePickup('mixer'); // made double chocolate cookie dough

dropUsePickup('oven', 'cookie_sheet'); //  BAKE COOKIES
drop('countertop') // dropping cookies off

inventory();
pickup('storage', 1); // sugar
drop('mixer');
pickup('storage', 5); // cocoa powder
drop('mixer');
buy('mint_flavoring', 100)
pickup('storage', 6); // mint flavoring
dropUsePickup('mixer'); // made chocolate mint frosting
// drop('countertop');

addDecoration('countertop') // adding frosting to cookies
addDecoration('countertop') // adding frosting to cookies
buy('rainbow_sprinkles', 10);
pickup('storage', 7)
addDoodad('countertop') // adding sprinkles to cookies


inventory();
console.log('BREAKPOINT ME TO PLAY');
