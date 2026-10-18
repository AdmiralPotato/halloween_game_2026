import type {
	CookingInput,
	CookingCompatibilityEval
} from "./recipes.ts";
import {
	getFirstRecipeForOutput,
	getRecipesForOutput,
	cookEval,
 } from "./recipes.ts";

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

	if (found.panSatisfied !== expected.panSatisfied) {
		logAndOrSaveMessage(`panSatisfied: expected ${expected.panSatisfied}, found ${found.panSatisfied}`);
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

	const foundExtraneousIngredients = sortAndStringifyArray(found.extraneousIngredients.map(v=>v.name))
	const expectedExtraneousIngredients = sortAndStringifyArray(expected.extraneousIngredients.map(v=>v.name))
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
				{ name: 'flour', quantity: 1, modifiers: [] },
				{ name: 'sugar', quantity: 1, modifiers: [] },
				{ name: 'orange_flavoring', quantity: 1, modifiers: [] },
			],
		},
		expected: {
			output: 'cookie_dough',
			quantity: 1,
			inheritedModifiers: [],
			newModifiers: [ 'orange_flavoring' ],
			recipeAttempted: getFirstRecipeForOutput('cookie_dough'),
			errorCount: 0,
			missingIngredients: [],
			extraneousIngredients: [],
			panSatisfied: true,
		},
	},
	{
		input: {
			location: 'mixer',
			ingredients: [
				{ name: 'cookie_dough', quantity: 1, modifiers: [] },
				{ name: 'orange_flavoring', quantity: 1, modifiers: [] },
			],
		},
		expected: {
			output: 'cookie_dough',
			quantity: 1,
			inheritedModifiers: [],
			newModifiers: [ 'orange_flavoring' ],
			recipeAttempted: getRecipesForOutput('cookie_dough')[1],
			errorCount: 0,
			missingIngredients: [],
			extraneousIngredients: [],
			panSatisfied: true,
		},
	},
	{
		input: {
			location: 'mixer',
			ingredients: [
				{ name: 'flour', quantity: 1, modifiers: [] },
				{ name: 'sugar', quantity: 1, modifiers: [] },
				{ name: 'orange_flavoring', quantity: 1, modifiers: [] },
				{ name: 'cocoa_powder', quantity: 1, modifiers: [] },
			],
		},
		expected: {
			output: 'cookie_dough',
			quantity: 1,
			inheritedModifiers: [],
			newModifiers: [ 'orange_flavoring', 'cocoa_powder' ],
			recipeAttempted: getFirstRecipeForOutput('cookie_dough'),
			errorCount: 0,
			missingIngredients: [],
			extraneousIngredients: [],
			panSatisfied: true,
		},
	},
	{
		input: {
			location: 'mixer',
			ingredients: [
				{ name: 'cookie_dough', quantity: 1, modifiers: [] },
				{ name: 'orange_flavoring', quantity: 1, modifiers: [] },
				{ name: 'cocoa_powder', quantity: 1, modifiers: [] },
			],
		},
		expected: {
			output: 'cookie_dough',
			quantity: 1,
			inheritedModifiers: [],
			newModifiers: [ 'orange_flavoring', 'cocoa_powder' ],
			recipeAttempted: getRecipesForOutput('cookie_dough')[1],
			errorCount: 0,
			missingIngredients: [],
			extraneousIngredients: [],
			panSatisfied: true,
		},
	},
	{
		input: {
			location: 'mixer',
			ingredients: [
				{ name: 'cookie_dough', quantity: 1, modifiers: [ 'cocoa_powder' ] },
				{ name: 'orange_flavoring', quantity: 1, modifiers: [] },
			],
		},
		expected: {
			output: 'cookie_dough',
			quantity: 1,
			inheritedModifiers: [ 'cocoa_powder' ],
			newModifiers: [ 'orange_flavoring' ],
			recipeAttempted: getRecipesForOutput('cookie_dough')[1],
			errorCount: 0,
			missingIngredients: [],
			extraneousIngredients: [],
			panSatisfied: true,
		},
	},
	{
		input: {
			location: 'mixer',
			ingredients: [
				{ name: 'cookie_dough', quantity: 1, modifiers: [ 'cocoa_powder' ] },
				{ name: 'orange_flavoring', quantity: 1, modifiers: [] },
				{ name: 'frosting', quantity: 1, modifiers: [] },
			],
		},
		expected: {
			output: 'cookie_dough',
			quantity: 1,
			inheritedModifiers: [ 'cocoa_powder' ],
			newModifiers: [ 'orange_flavoring' ],
			recipeAttempted: getRecipesForOutput('cookie_dough')[1],
			errorCount: 1,
			missingIngredients: [],
			extraneousIngredients: [{ name: 'frosting', quantity: 1, modifiers: [] }],
			panSatisfied: true,
		},
	},
	{
		input: {
			location: 'mixer',
			ingredients: [
				{ name: 'sugar', quantity: 1, modifiers: [] },
				{ name: 'cocoa_powder', quantity: 2, modifiers: [] },
			],
		},
		expected: {
			output: 'frosting',
			quantity: 2,
			inheritedModifiers: [],
			newModifiers: [ 'cocoa_powder', 'cocoa_powder' ],
			recipeAttempted: getFirstRecipeForOutput('frosting'),
			errorCount: 0,
			missingIngredients: [],
			extraneousIngredients: [],
			panSatisfied: true,
		},
	},
];

export const doCookingTests = () => {
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
		console.log("ALL COOKING TESTS PASS!");
	} else {
		console.error("COOKING TESTS HAD ISSUES");
		testsMap.forEach(console.error);
	}
}

