import type { AttributeMap } from "./attributes.ts";
import { compareAttributes } from "./attributes.ts";
import { getAttributesForItem } from "./main.ts";

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
			pale: 3,
			soft: 1,
			sweet: 2,
			chocolatey: 1,
			dark: 2,
			orange: 1,
		}
	}
];

const testsMap = attributeTests.map((test, i)=>{
	const found = getAttributesForItem(test.input.item, test.input.modifiers);
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
