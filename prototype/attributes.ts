// COLOR

type Color = 'pale' | 'dark' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'varigated';
const colors = new Set([ 'pale', 'dark', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'varigated' ]);
const isColor = (v: unknown): v is Color => typeof v === 'string' && colors.has(v);

type ColorInfo = {
	attribute: string;
	type: 'color';
	neighbors?: Color[];
	opposite?: Color
};
const isColorInfo = (v: unknown): v is ColorInfo => (v as ColorInfo).type === 'color';

// TEXTURE

type Texture = 'dry' | 'moist' | 'soft' | 'hard' | 'sticky' | 'crumbly' | 'pop';
const textures = new Set([ 'dry', 'moist', 'soft', 'hard', 'sticky', 'crumbly', 'pop' ]);
const isTexture = (v: unknown): v is Texture => typeof v === 'string' && textures.has(v);

type TextureInfo = {
	attribute: string;
	type: 'texture';
	opposite?: Texture;
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
		neighbors: [ 'blue', 'purple' ],
	},
	dark: {
		type: 'color',
		attribute: 'dark',
		opposite: 'pale',
		neighbors: [ 'yellow', 'orange' ],
	},
	red: {
		type: 'color',
		attribute: 'red',
		neighbors: ['purple', 'orange'],
	},
	orange: {
		type: 'color',
		attribute: 'orange',
		neighbors: ['red', 'yellow', 'pale'],
	},
	yellow: {
		type: 'color',
		attribute: 'yellow',
		neighbors: ['orange', 'green', 'pale'],
	},
	green: {
		type: 'color',
		attribute: 'green',
		neighbors: ['yellow', 'blue'],
	},
	blue: {
		type: 'color',
		attribute: 'blue',
		neighbors: ['green', 'purple', 'dark'],
	},
	purple: {
		type: 'color',
		attribute: 'purple',
		neighbors: ['blue', 'red', 'dark'],
	},
	varigated: {
		type: 'color',
		attribute: 'varigated',
	},
	dry: {
		type: 'texture',
		attribute: 'dry',
		opposite: 'moist',
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
	hard: {
		type: 'texture',
		attribute: 'hard',
		opposite: 'soft',
	},
	sticky: {
		type: 'texture',
		attribute: 'sticky',
		opposite: 'crumbly',
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
	[...keys].forEach(key=>{
		if (!isAttribute(key)) { throw new Error (`${key} is not an attribute!`)}
		a[key] = (a[key] || 0) + (b[key] || 0);
	})
	return a;
};
