import { cook } from "./main.ts";
import type {
	CookingInput,
	CookingCompatibilityEval,
} from "./main.ts";

const standardizeArray = (arr: string[]) => `[` + structuredClone(arr.sort()).join(', ') + `]`;

export type CookingCompatibilityTest = {
	input: CookingInput;
	expected: CookingCompatibilityEval;
};

const compareCookingCompatibilityEvals = (found: CookingCompatibilityEval, expected: CookingCompatibilityEval): string[] => {
	const messages: string[] = [];

	const logAndOrSaveMessage = (v: string) => {
		messages.push(v);
		console.log(v);
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

	const foundInheritedMods = standardizeArray(found.inheritedModifiers)
	const expectedInheritedMods = standardizeArray(expected.inheritedModifiers)
	if (foundInheritedMods !== expectedInheritedMods) {
		logAndOrSaveMessage(`inheritedModifiers: expected ${expectedInheritedMods}, found ${foundInheritedMods}`);
	}

	const foundNewMods = standardizeArray(found.newModifiers)
	const expectedNewMods = standardizeArray(expected.newModifiers)
	if (foundNewMods !== expectedNewMods) {
		logAndOrSaveMessage(`newModifiers: expected ${expectedNewMods}, found ${foundNewMods}`);
	}

	const foundMissingIngredients = standardizeArray(found.missingIngredients)
	const expectedMissingIngredients = standardizeArray(expected.missingIngredients)
	if (foundMissingIngredients !== expectedMissingIngredients) {
		logAndOrSaveMessage(`missingIngredients: expected ${expectedMissingIngredients}, found ${foundMissingIngredients}`);
	}

	const foundExtraneousIngredients = standardizeArray(found.extraneousIngredients.map(v=>v.item))
	const expectedExtraneousIngredients = standardizeArray(expected.extraneousIngredients.map(v=>v.item))
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
];

const testsMap = cookingCompatibilityTests.map((test, i)=>{
	const found = cook(test.input.location, test.input.ingredients);
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
