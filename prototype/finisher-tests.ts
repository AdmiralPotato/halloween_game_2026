import type { FinishedProduct } from "./finishers.ts";
import { prettyPrintFinishedProduct } from "./finishers.ts";

type FinisherTest = {
	input: FinishedProduct;
	expected: string;
}

const finisherTests: FinisherTest[] = [
	{
		input: {
			product: 'cookie',
			quantity: 12,
			modifiers: [],
			filling: [],
			decoration: [],
			doodad: []
		},
		expected: '12x cookie'
	},
	{
		input: {
			product: 'cookie',
			quantity: 12,
			modifiers: ['cocoa_powder'],
			filling: [],
			decoration: [],
			doodad: []
		},
		expected: '12x chocolate cookie'
	},
	{
		input: {
			product: 'cookie',
			quantity: 12,
			modifiers: ['cocoa_powder', 'cocoa_powder'],
			filling: [],
			decoration: [],
			doodad: []
		},
		expected: '12x double chocolate cookie'
	},
	{
		input: {
			product: 'cupcake',
			quantity: 6,
			modifiers: ['cocoa_powder', 'cocoa_powder'],
			filling: [],
			decoration: [],
			doodad: []
		},
		expected: '6x double chocolate cupcake'
	},
	{
		input: {
			product: 'cupcake',
			quantity: 6,
			modifiers: ['cocoa_powder', 'cocoa_powder'],
			filling: [
				{ item: 'pastry_cream', quantity: 1, modifiers: [] }
			],
			decoration: [],
			doodad: []
		},
		expected: '6x double chocolate cupcake with pastry cream filling'
	},
	{
		input: {
			product: 'cupcake',
			quantity: 6,
			modifiers: ['cocoa_powder', 'cocoa_powder'],
			filling: [
				{ item: 'pastry_cream', quantity: 1, modifiers: [] }
			],
			decoration: [],
			doodad: [{ item: 'rainbow_sprinkles', quantity: 1, modifiers: [] }]
		},
		expected: '6x double chocolate cupcake with pastry cream filling, topped with rainbow sprinkles'
	},
	{
		input: {
			product: 'cupcake',
			quantity: 6,
			modifiers: ['cocoa_powder', 'cocoa_powder'],
			filling: [
				{ item: 'pastry_cream', quantity: 1, modifiers: [] }
			],
			decoration: [],
			doodad: [
				{ item: 'rainbow_sprinkles', quantity: 2, modifiers: [] }
			]
		},
		expected: '6x double chocolate cupcake with pastry cream filling, topped with extra rainbow sprinkles'
	},
	{
		input: {
			product: 'cupcake',
			quantity: 6,
			modifiers: ['cocoa_powder', 'cocoa_powder'],
			filling: [
				{ item: 'pastry_cream', quantity: 1, modifiers: [] }
			],
			decoration: [
				{ item: 'frosting', quantity: 1, modifiers: ['cocoa_powder', 'cocoa_powder'] },
				{ item: 'whipped_cream', quantity: 2, modifiers: [] },
			],
			doodad: [
				{ item: 'rainbow_sprinkles', quantity: 2, modifiers: [] }
			]
		},
		expected: '6x double chocolate cupcake with pastry cream filling, with double chocolate frosting and extra whipped cream, topped with extra rainbow sprinkles'
	},
	{
		input: {
			product: 'cookie',
			quantity: 12,
			modifiers: ['chocolate_chips'],
			filling: [],
			decoration: [{ item: 'frosting', quantity: 1, modifiers: ['cocoa_powder', 'mint_flavoring'] }],
			doodad: []
		},
		expected: '12x chocolate chip cookie with chocolate mint frosting'
	},
]

const errorMessages: string[] = [];
const logAndOrSaveMessage = (v: string) => {
	errorMessages.push(v);
	console.log(v);
}
finisherTests.map((test, i)=>{
	const found = prettyPrintFinishedProduct(test.input);
	if (found !== test.expected) {
		logAndOrSaveMessage(`Test #${i}:`)
		logAndOrSaveMessage(`>> Expected: '${test.expected}'`)
		logAndOrSaveMessage(`>>>>> Found: '${found}'`)
	}
});

if (errorMessages.length === 0) {
	console.log("ALL FINISHER PRINT TESTS PASS, BOSS");
}

