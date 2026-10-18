import type { Product } from "./utilities.ts";
import { printFinishedProduct } from "./utilities.ts";

type FinisherTest = {
	input: Product;
	expected: string;
}

const finisherTests: FinisherTest[] = [
	{
		input: {
			name: 'cookie',
			quantity: 12,
			modifiers: [],
			fillings: [],
			decorations: [],
			doodads: []
		},
		expected: '12x cookie'
	},
	{
		input: {
			name: 'cookie',
			quantity: 12,
			modifiers: ['cocoa_powder'],
			fillings: [],
			decorations: [],
			doodads: []
		},
		expected: '12x chocolate cookie'
	},
	{
		input: {
			name: 'cookie',
			quantity: 12,
			modifiers: ['cocoa_powder', 'cocoa_powder'],
			fillings: [],
			decorations: [],
			doodads: []
		},
		expected: '12x double chocolate cookie'
	},
	{
		input: {
			name: 'cupcake',
			quantity: 6,
			modifiers: ['cocoa_powder', 'cocoa_powder'],
			fillings: [],
			decorations: [],
			doodads: []
		},
		expected: '6x double chocolate cupcake'
	},
	{
		input: {
			name: 'cupcake',
			quantity: 6,
			modifiers: ['cocoa_powder', 'cocoa_powder'],
			fillings: [
				{ name: 'pastry_cream', quantity: 1, modifiers: [] }
			],
			decorations: [],
			doodads: []
		},
		expected: '6x double chocolate cupcake with pastry cream filling'
	},
	{
		input: {
			name: 'cupcake',
			quantity: 6,
			modifiers: ['cocoa_powder', 'cocoa_powder'],
			fillings: [
				{ name: 'pastry_cream', quantity: 1, modifiers: [] }
			],
			decorations: [],
			doodads: [{ name: 'rainbow_sprinkles', quantity: 1, modifiers: [] }]
		},
		expected: '6x double chocolate cupcake with pastry cream filling, topped with rainbow sprinkles'
	},
	{
		input: {
			name: 'cupcake',
			quantity: 6,
			modifiers: ['cocoa_powder', 'cocoa_powder'],
			fillings: [
				{ name: 'pastry_cream', quantity: 1, modifiers: [] }
			],
			decorations: [],
			doodads: [
				{ name: 'rainbow_sprinkles', quantity: 2, modifiers: [] }
			]
		},
		expected: '6x double chocolate cupcake with pastry cream filling, topped with extra rainbow sprinkles'
	},
	{
		input: {
			name: 'cupcake',
			quantity: 6,
			modifiers: ['cocoa_powder', 'cocoa_powder'],
			fillings: [
				{ name: 'pastry_cream', quantity: 1, modifiers: [] }
			],
			decorations: [
				{ name: 'frosting', quantity: 1, modifiers: ['cocoa_powder', 'cocoa_powder'] },
				{ name: 'whipped_cream', quantity: 2, modifiers: [] },
			],
			doodads: [
				{ name: 'rainbow_sprinkles', quantity: 2, modifiers: [] }
			]
		},
		expected: '6x double chocolate cupcake with pastry cream filling, with double chocolate frosting and extra whipped cream, topped with extra rainbow sprinkles'
	},
	{
		input: {
			name: 'cookie',
			quantity: 12,
			modifiers: ['chocolate_chips'],
			fillings: [],
			decorations: [{ name: 'frosting', quantity: 1, modifiers: ['cocoa_powder', 'mint_flavoring'] }],
			doodads: []
		},
		expected: '12x chocolate chip cookie with chocolate mint frosting'
	},
]

export const doFinisherTests = () => {
	const errorMessages: string[] = [];
	const logAndOrSaveMessage = (v: string) => {
		errorMessages.push(v);
		// console.log(v);
	}


	finisherTests.map((test, i)=>{
		const found = printFinishedProduct(test.input);
		if (found !== test.expected) {
			logAndOrSaveMessage(`Test #${i}:`)
			logAndOrSaveMessage(`>> Expected: '${test.expected}'`)
			logAndOrSaveMessage(`>>>>> Found: '${found}'`)
		}
	});

	if (errorMessages.length === 0) {
		console.log("ALL FINISHER PRINT TESTS PASS!");
	} else {
		console.error("FINISHER TESTS HAD ISSUES");
		errorMessages.forEach(console.error);
	}
};
