import type { CookingInput, CookingCompatibilityEval } from "./main.ts";
import { cookEval } from "./main.ts";

import { sortAndStringifyArray } from "./utilities.ts";

export type CookingCompatibilityTest = {
	input: CookingInput;
	expected: CookingCompatibilityEval;
};

const compareCookingCompatibilityEvals = (found: CookingCompatibilityEval, expected: CookingCompatibilityEval): string[] => {
	const messages: string[] = [];

	const logAndOrSaveMessage = (v: string) => {
		messages.push(v);
		// console.log(v);
	}

	if (found.errorCount !== expected.errorCount) {
		logAndOrSaveMessage(`ERROR COUNT MISMATCH! Expected ${expected.errorCount}, found ${found.errorCount}`);
	}

	if (found.output !== expected.output) {
		logAndOrSaveMessage(`output: expected ${expected.output}, found ${found.output}`);
	}

	if (found.quantity !== expected.quantity) {
		logAndOrSaveMessage(`quantity: expected ${expected.quantity}, found ${found.quantity}`);
	}

	const foundInheritedMods = sortAndStringifyArray(found.inheritedModifiers)
	const expectedInheritedMods = sortAndStringifyArray(expected.inheritedModifiers)
	if (foundInheritedMods !== expectedInheritedMods) {
		logAndOrSaveMessage(`inheritedModifiers: expected ${expectedInheritedMods}, found ${foundInheritedMods}`);
	}

	const foundNewMods = sortAndStringifyArray(found.newModifiers)
	const expectedNewMods = sortAndStringifyArray(expected.newModifiers)
	if (foundNewMods !== expectedNewMods) {
		logAndOrSaveMessage(`newModifiers: expected ${expectedNewMods}, found ${foundNewMods}`);
	}

	const foundMissingIngredients = sortAndStringifyArray(found.missingIngredients)
	const expectedMissingIngredients = sortAndStringifyArray(expected.missingIngredients)
	if (foundMissingIngredients !== expectedMissingIngredients) {
		logAndOrSaveMessage(`missingIngredients: expected ${expectedMissingIngredients}, found ${foundMissingIngredients}`);
	}

	const foundExtraneousIngredients = sortAndStringifyArray(found.extraneousIngredients.map(v=>v.item))
	const expectedExtraneousIngredients = sortAndStringifyArray(expected.extraneousIngredients.map(v=>v.item))
	if (foundExtraneousIngredients !== expectedExtraneousIngredients) {
		logAndOrSaveMessage(`extraneousIngredients: expected ${expectedExtraneousIngredients}, found ${foundExtraneousIngredients}`);
	}

	return messages;
}

const cookingCompatibilityTests: CookingCompatibilityTest[] = [
	{
		input: {
			location: 'mixer',
			ingredients: [
				{ item: 'flour', quantity: 1, modifiers: [] },
				{ item: 'sugar', quantity: 1, modifiers: [] },
				{ item: 'orange_flavoring', quantity: 1, modifiers: [] },
			],
		},
		expected: {
			output: 'cookie_dough',
			quantity: 1,
			inheritedModifiers: [],
			newModifiers: [ 'orange_flavoring' ],
			errorCount: 0,
			missingIngredients: [],
			extraneousIngredients: [],
		},
	},
	{
		input: {
			location: 'mixer',
			ingredients: [
				{ item: 'cookie_dough', quantity: 1, modifiers: [] },
				{ item: 'orange_flavoring', quantity: 1, modifiers: [] },
			],
		},
		expected: {
			output: 'cookie_dough',
			quantity: 1,
			inheritedModifiers: [],
			newModifiers: [ 'orange_flavoring' ],
			errorCount: 0,
			missingIngredients: [],
			extraneousIngredients: [],
		},
	},
	{
		input: {
			location: 'mixer',
			ingredients: [
				{ item: 'flour', quantity: 1, modifiers: [] },
				{ item: 'sugar', quantity: 1, modifiers: [] },
				{ item: 'orange_flavoring', quantity: 1, modifiers: [] },
				{ item: 'cocoa_powder', quantity: 1, modifiers: [] },
			],
		},
		expected: {
			output: 'cookie_dough',
			quantity: 1,
			inheritedModifiers: [],
			newModifiers: [ 'orange_flavoring', 'cocoa_powder' ],
			errorCount: 0,
			missingIngredients: [],
			extraneousIngredients: [],
		},
	},
	{
		input: {
			location: 'mixer',
			ingredients: [
				{ item: 'cookie_dough', quantity: 1, modifiers: [] },
				{ item: 'orange_flavoring', quantity: 1, modifiers: [] },
				{ item: 'cocoa_powder', quantity: 1, modifiers: [] },
			],
		},
		expected: {
			output: 'cookie_dough',
			quantity: 1,
			inheritedModifiers: [],
			newModifiers: [ 'orange_flavoring', 'cocoa_powder' ],
			errorCount: 0,
			missingIngredients: [],
			extraneousIngredients: [],
		},
	},
	{
		input: {
			location: 'mixer',
			ingredients: [
				{ item: 'cookie_dough', quantity: 1, modifiers: [ 'cocoa_powder' ] },
				{ item: 'orange_flavoring', quantity: 1, modifiers: [] },
			],
		},
		expected: {
			output: 'cookie_dough',
			quantity: 1,
			inheritedModifiers: [ 'cocoa_powder' ],
			newModifiers: [ 'orange_flavoring' ],
			errorCount: 0,
			missingIngredients: [],
			extraneousIngredients: [],
		},
	},
	{
		input: {
			location: 'mixer',
			ingredients: [
				{ item: 'cookie_dough', quantity: 1, modifiers: [ 'cocoa_powder' ] },
				{ item: 'orange_flavoring', quantity: 1, modifiers: [] },
				{ item: 'frosting', quantity: 1, modifiers: [] },
			],
		},
		expected: {
			output: 'cookie_dough',
			quantity: 1,
			inheritedModifiers: [ 'cocoa_powder' ],
			newModifiers: [ 'orange_flavoring' ],
			errorCount: 1,
			missingIngredients: [],
			extraneousIngredients: [{ item: 'frosting', quantity: 1, modifiers: [] }],
		},
	},
	{
		input: {
			location: 'mixer',
			ingredients: [
				{ item: 'sugar', quantity: 1, modifiers: [] },
				{ item: 'cocoa_powder', quantity: 2, modifiers: [] },
			],
		},
		expected: {
			output: 'frosting',
			quantity: 2,
			inheritedModifiers: [],
			newModifiers: [ 'cocoa_powder', 'cocoa_powder' ],
			errorCount: 0,
			missingIngredients: [],
			extraneousIngredients: [],
		},
	},
];

const testsMap = cookingCompatibilityTests.map((test, i)=>{
	const found = cookEval(test.input.location, test.input.ingredients);
	const errorMessages = compareCookingCompatibilityEvals(found, test.expected);
	if (errorMessages.length > 0) {
		console.error(`Test #${i}: ${errorMessages.length} errors!`)
		console.error(errorMessages.join('\n'))
	}
	return errorMessages;
});

if (testsMap.flat().length === 0) {
	console.log("ALL COOKING TESTS PASS, BOSS");
}
