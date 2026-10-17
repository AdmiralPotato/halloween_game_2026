import type { AttributeMap } from "./attributes.ts";
import { compareAttributes } from "./attributes.ts";

import { getAttributesForItemNameAndModifiers } from "./recipes.ts";

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

export const doAttributeTests = () => {
	const errorMessages: string[] = [];
	const testsMap = attributeTests.map((test, i)=>{
		const found = getAttributesForItemNameAndModifiers(test.input.item, test.input.modifiers);
		const errors = compareAttributes(test.expected, found);
		if (errors.length > 0) {
			errorMessages.push(`Test #${i}: ${errors.length} errors!`)
			errorMessages.push(...errors);
		}
		return errors;
	});
	
	if (testsMap.flat().length === 0) {
		console.log("ALL ATTRIBUTE TESTS PASS!");
	} else {
		console.error("ATTRIBUTE TESTS HAD ISSUES");
		errorMessages.forEach(console.error);
	}
};

