// COLOR

import { isArrayOfNumbers } from "./utilities.ts";

type Color = 'pale' | 'red' | 'orange' | 'brown' | 'yellow' | 'green' | 'blue' | 'purple' | 'varigated';
const colors = new Set([ 'pale', 'red', 'orange', 'brown', 'yellow', 'green', 'blue', 'purple', 'varigated' ]);
const isColor = (v: unknown): v is Color => typeof v === 'string' && colors.has(v);

type ColorInfo = {
	attribute: string;
	type: 'color';
	neighbors?: Color[];
	opposite?: Color | 'dark';
};
const isColorInfo = (v: unknown): v is ColorInfo => (v as ColorInfo).type === 'color';

// TEXTURE

type Texture = 'moist' | 'soft' | 'crumbly' | 'pop';
const textures = new Set([ 'moist', 'soft', 'crumbly', 'pop' ]);
const isTexture = (v: unknown): v is Texture => typeof v === 'string' && textures.has(v);

type TextureInfo = {
	attribute: string;
	type: 'texture';
	opposite?: Texture | 'dry' | 'hard' | 'sticky';
};
const isTextureInfo = (v: unknown): v is TextureInfo => (v as TextureInfo).type === 'texture';

// FLAVOR

type Flavor = 'nutty' | 'savory' | 'chocolatey' | 'fruity' | 'minty' | 'salty' | 'sweet' | 'tart' | 'floral';
const flavors = new Set([ 'nutty', 'savory', 'chocolatey', 'fruity', 'minty', 'salty', 'sweet', 'tart', 'floral' ]);
const isFlavor = (v: unknown): v is Flavor => typeof v === 'string' && flavors.has(v);

type FlavorInfo = {
	attribute: string;
	type: 'flavor';
	opposite?: Flavor;
};
const isFlavorInfo = (v: unknown): v is FlavorInfo => (v as FlavorInfo).type === 'flavor';

// ALL TOGETHER

type Attribute = Color | Texture | Flavor ;
export const isAttribute = (v: unknown): v is Attribute => isColor(v) || isTexture(v) || isFlavor(v);

//  ----------------------------------------- THE ACTUAL INFO ----------------------------------------- //

type AttributeInfo = ColorInfo | TextureInfo | FlavorInfo;

const attributeInfo: Record<Attribute, AttributeInfo> = {
	pale: {
		type: 'color',
		attribute: 'pale',
		opposite: 'dark',
	},
	red: {
		type: 'color',
		attribute: 'red',
		neighbors: ['purple', 'orange'],
	},
	orange: {
		type: 'color',
		attribute: 'orange',
		neighbors: ['red', 'yellow', 'brown'],
	},
	yellow: {
		type: 'color',
		attribute: 'yellow',
		neighbors: ['orange', 'green', 'brown'],
	},
	brown: {
		type: 'color',
		attribute: 'yellow',
		neighbors: ['orange', 'yellow'],
	},
	green: {
		type: 'color',
		attribute: 'green',
		neighbors: ['yellow', 'blue'],
	},
	blue: {
		type: 'color',
		attribute: 'blue',
		neighbors: ['green', 'purple'],
	},
	purple: {
		type: 'color',
		attribute: 'purple',
		neighbors: ['blue', 'red'],
	},
	varigated: {
		type: 'color',
		attribute: 'varigated',
	},
	moist: {
		type: 'texture',
		attribute: 'moist',
		opposite: 'dry',
	},
	soft: {
		type: 'texture',
		attribute: 'soft',
		opposite: 'hard',
	},
	crumbly: {
		type: 'texture',
		attribute: 'crumbly',
		opposite: 'sticky',
	},
	pop: {
		type: 'texture',
		attribute: 'pop',
	},
	nutty: {
		type: 'flavor',
		attribute: 'nutty',
	},
	savory: {
		type: 'flavor',
		attribute: 'savory',
	},
	chocolatey: {
		type: 'flavor',
		attribute: 'chocolatey',
	},
	fruity: {
		type: 'flavor',
		attribute: 'fruity',
	},
	minty: {
		type: 'flavor',
		attribute: 'minty',
	},
	salty: {
		type: 'flavor',
		attribute: 'salty',
	},
	sweet: {
		type: 'flavor',
		attribute: 'sweet',
	},
	tart: {
		type: 'flavor',
		attribute: 'tart',
	},
	floral: {
		type: 'flavor',
		attribute: 'floral',
	},
};
const getAttributeInfo = (v: string) => {
	if (!isAttribute(v)) {
		throw new Error (`${v} is not an Attribute!`);
	}
	return attributeInfo[v];
};

export const maillardAttributes = { pale: -1 };

//  ----------------------------------------- COLLECTING ATTRIBUTES ----------------------------------------- //

export type AttributeMap = Partial<Record<Attribute, number>>;
export const isAttributeMap = (v: unknown): v is AttributeMap => {
	if (typeof v !== 'object' || v === null) {
		return false;
	}
	const keysAreGood = Object.keys(v).every(v=>isAttribute(v));
	const valuesAreGood = Object.values(v).every(v=>typeof v === 'number');
	return keysAreGood && valuesAreGood;
};

export const addAttributesToMap = (a: AttributeMap, b: AttributeMap) => {
	const keysA = Object.keys(a);
	const keysB = Object.keys(b);
	const keys = new Set([...keysA, ...keysB]);
	[...keys].forEach(k=>{
		if (!isAttribute(k)) { throw new Error (`${k} is not an attribute!`)}
		a[k] = (a[k] || 0) + (b[k] || 0);
	})
	return a;
};

export type AttributeSpread = Partial<Record<Attribute, number[]>>;
export const isAttributeSpread = (v: unknown): v is AttributeSpread => {
	if (typeof v !== 'object' || v === null) {
		return false;
	}
	const keysAreGood = Object.keys(v).every(k=>isAttribute(k));
	const valuesAreGood = Object.values(v).every(arr=>{
		return isArrayOfNumbers(arr);
	});
	return keysAreGood && valuesAreGood;
};

export const addAttributesToSpread = (spread: AttributeSpread, atts: AttributeMap) => {
	const keysA = Object.keys(spread);
	const keysB = Object.keys(atts);
	const keys = new Set([...keysA, ...keysB]);
	[...keys].forEach(k=>{
		if (!isAttribute(k)) { throw new Error (`${k} is not an attribute!`)}
		spread[k] = spread[k] || [];
		if (atts[k] !== undefined) {
			spread[k].push(atts[k]);
		}
		spread[k].sort((a, b)=>a-b);
	})
	return spread;
};

//  ----------------------------------------- COMPARE ATTRIBUTES ----------------------------------------- //

export const compareAttributes = (expected: AttributeMap, found: AttributeMap): string[] => {
	const keysFound: string[] = Object.keys(found);
	const keysExpected: string[] = Object.keys(expected);
	if (!keysFound.every(v=>isAttribute(v))) { throw new Error(`TS fr`); }
	if (!keysExpected.every(v=>isAttribute(v))) { throw new Error(`TS fr`); }
	const uniqueKeys: Attribute[] = [...new Set([...keysFound, ...keysExpected])];
	const mismatchMessages: string[] = [];

	const logAndOrSaveMessage = (v: string) => {
		mismatchMessages.push(v);
		console.log(v);
	}

	for (let i = 0; i < uniqueKeys.length; i++) {
		const key = uniqueKeys[i];
		if (found[key] !== expected[key]) {
			logAndOrSaveMessage(`found "${key}: ${found[key] || 0}", expected ${expected[key] || 0}"`);
		}
	}
	return mismatchMessages;
};
