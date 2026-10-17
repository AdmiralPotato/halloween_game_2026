import type { AttributeMap } from "./attributes.ts";
import { compareAttributes } from "./attributes.ts";
import { getAttributesForItemNameAndModifiers } from "./main.ts";

type AttributeTest = {
	input: {
		item: string;
		modifiers: string[]
	},
	expected: AttributeMap;
}

const attributeTests: AttributeTest[] = [
	{
		input: {
			item: 'frosting',
			modifiers: [ 'cocoa_powder' ]
		},
		expected: {
			pale: 1, // 3 pale from frosting, -2 pale from cocoa_powder
			soft: 1,
			sweet: 2,
			chocolatey: 1,
			orange: 1,
		}
	},
];

const testsMap = attributeTests.map((test, i)=>{
	const found = getAttributesForItemNameAndModifiers(test.input.item, test.input.modifiers);
	const errorMessages = compareAttributes(test.expected, found);
	if (errorMessages.length > 0) {
		console.error(`Test #${i}: ${errorMessages.length} errors!`)
		console.error(errorMessages.join('\n'))
	}
	return errorMessages;
});

if (testsMap.flat().length === 0) {
	console.log("ALL ATTRIBUTE TESTS PASS, BOSS");
}
