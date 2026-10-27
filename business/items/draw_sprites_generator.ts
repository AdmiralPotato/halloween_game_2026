// --------------------------------------------- Shared info --------------------------------------------- //

const commonColors: Record<string, { base: string; shadow: string; }> = {
	chocolate: { 'base': '#9e8374', 'shadow': '#63453a' },
	cherry: { 'base': '#c98699', 'shadow': '#7b394c' },
	raspberry: { 'base': '#f3a9c8', 'shadow': '#ad497c' },
	strawberry: { 'base': '#e39fac', 'shadow': '#c05a65' },
	orange: { 'base': '#f3c370', 'shadow': '#b37537' },
	almond: { 'base': '#c4b39e', 'shadow': '#88734f' },
	caramel: { 'base': '#c7a16e', 'shadow': '#8d5f2e' },
	lemon: { 'base': '#f7ee93', 'shadow': '#c49d2c' },
	lime: { 'base': '#bedc73', 'shadow': '#66893d' },
	mint: { 'base': '#b5e0ce', 'shadow': '#569577' },
	blueberry: { 'base': '#7aa3c4', 'shadow': '#385f95' },
	ube: { 'base': '#a9a4c9', 'shadow': '#65639e' },
	grape: { 'base': '#b383cd', 'shadow': '#6b477b' }
};

const fileNames: Record<string, string> = {
	cake_batter: 'TILES-cake_batter.png',
	cake: 'TILES-cake.png',
	cake_slice: 'TILES-cake-sice.png',
	cookie: 'TILES-cookie-baked.png',
	cupcake: 'TILES-cupcake-baked.png',
	cookie_dough: 'TILES-dough.png',
	frosting: 'TILES-frosting.png',
	other: 'TILES-other.png',
};

type SpriteInfo = {
	file: string,
	x: number,
	y: number
};
type ComboSpriteInfo = {
	light: SpriteInfo,
	dark: SpriteInfo
};
const comboSpriteInfo: Record<string, ComboSpriteInfo> = {
	cake_batter: {
		light: { file: fileNames.cake_batter, x: 0, y: 0 },
		dark: { file: fileNames.cake_batter, x: 1, y: 0 },
	},
	cookie_dough: {
		light: { file: fileNames.cookie_dough, x: 0, y: 0 },
		dark: { file: fileNames.cookie_dough, x: 1, y: 0 },
	},
	cookie_base: {
		light: { file: fileNames.cookie, x: 0, y: 0 },
		dark: { file: fileNames.cookie, x: 1, y: 0 },
	},
	cookie_frosting: {
		light: { file: fileNames.cookie, x: 2, y: 0 },
		dark: { file: fileNames.cookie, x: 3, y: 0 },
	},
	cupcake_base: {
		light: { file: fileNames.cupcake, x: 0, y: 0 },
		dark: { file: fileNames.cupcake, x: 1, y: 0 },
	},
	cupcake_frosting: {
		light: { file: fileNames.cupcake, x: 2, y: 0 },
		dark: { file: fileNames.cupcake, x: 3, y: 0 },
	},
	cupcake_liner: {
		light: { file: fileNames.cupcake, x: 4, y: 0 },
		dark: { file: fileNames.cupcake, x: 5, y: 0 },
	},
	cake_base: {
		light: { file: fileNames.cake, x: 0, y: 0 },
		dark: { file: fileNames.cake, x: 1, y: 0 },
	},
	cake_frosting: {
		light: { file: fileNames.cake, x: 2, y: 0 },
		dark: { file: fileNames.cake, x: 3, y: 0 },
	},
	cake_piping: {
		light: { file: fileNames.cake, x: 4, y: 0 },
		dark: { file: fileNames.cake, x: 5, y: 0 },
	},
	cake_slice_base: {
		light: { file: fileNames.cake_slice, x: 0, y: 0 },
		dark: { file: fileNames.cake_slice, x: 1, y: 0 },
	},
	cake_slice_frosting: {
		light: { file: fileNames.cake_slice, x: 2, y: 0 },
		dark: { file: fileNames.cake_slice, x: 3, y: 0 },
	},
	cake_slice_piping: {
		light: { file: fileNames.cake_slice, x: 4, y: 0 },
		dark: { file: fileNames.cake_slice, x: 5, y: 0 },
	},
	frosting: {
		light: { file: fileNames.frosting, x: 0, y: 0 },
		dark: { file: fileNames.frosting, x: 1, y: 0 },
	},
};

// --------------------------------------------- Draw info --------------------------------------------- //

type DrawLayer = Tile | multi | Ref;
type Mode = 'mix' | 'multiply';

type Tile = {
	type: 'sprite';
	mode: Mode;
	file: string;
	x: number;
	y: number;
	colorize?: string;
};
type multi = {
	type: 'multi';
	mode: Mode;
	sprites: DrawLayer[]
};
type Ref = {
	type: 'ref';
	value: string;
}

const quickComboTile =  (info: ComboSpriteInfo, mode: Mode, light: string, dark: string, extraTiles?: DrawLayer[]): DrawLayer => {
	return {
		type: 'multi',
		mode,
		sprites: [
			{ ...info.light, type: 'sprite', mode: 'mix', colorize: light },
			{ ...info.dark, type: 'sprite', mode: 'mix', colorize: dark },
			...(extraTiles || [])
		]
	}
};

// --------------------------------------------- Misc --------------------------------------------- //

const makeFlavorings = (info: ComboSpriteInfo): Record<string, DrawLayer> => {
	return {
		cocoa_powder:         quickComboTile(info, 'multiply', '#9e8374', '#63453a'),
		cherry_flavoring:     quickComboTile(info, 'multiply', '#c98699', '#7b394c'),
		raspberry_flavoring:  quickComboTile(info, 'multiply', '#f3a9c8', '#ad497c'),
		strawberry_flavoring: quickComboTile(info, 'multiply', '#e39fac', '#c05a65'),
		orange_flavoring:     quickComboTile(info, 'multiply', '#f3c370', '#b37537'),
		almond_flavoring:     quickComboTile(info, 'multiply', '#c4b39e', '#88734f'),
		caramel_flavoring:    quickComboTile(info, 'multiply', '#c7a16e', '#8d5f2e'),
		lemon_flavoring:      quickComboTile(info, 'multiply', '#f7ee93', '#c49d2c'),
		lime_flavoring:       quickComboTile(info, 'multiply', '#bedc73', '#66893d'),
		mint_flavoring:       quickComboTile(info, 'multiply', '#b5e0ce', '#569577'),
		blueberry_flavoring:  quickComboTile(info, 'multiply', '#7aa3c4', '#385f95'),
		ube_flavoring:        quickComboTile(info, 'multiply', '#a9a4c9', '#65639e'),
		grape_flavoring:      quickComboTile(info, 'multiply', '#b383cd', '#6b477b'),
	};
};

const data: Record<string, Record<string, Record<string, DrawLayer>>> = {
	cake_batter: {
		// Always draw:
		base: {
			root: quickComboTile(comboSpriteInfo.cake_batter, 'mix', '#f9ebcb', '#e0c074'),
		},
		// Draw once per count in modifiers:
		flavoring_modifiers: {
			...makeFlavorings(comboSpriteInfo.cake_batter),
		},
		// Draw once if any quantity is present in modifiers:
		other_modifiers: {
			chocolate_chips:       { type: 'sprite', mode: 'mix', file: fileNames.cake_batter, x: 0, y: 1 },
			white_chocolate_chips: { type: 'sprite', mode: 'mix', file: fileNames.cake_batter, x: 1, y: 1 },
			dark_chocolate_chips:  { type: 'sprite', mode: 'mix', file: fileNames.cake_batter, x: 2, y: 1 },
			chocolate_sprinkles:   { type: 'sprite', mode: 'mix', file: fileNames.cake_batter, x: 3, y: 1 },
			white_sprinkles:       { type: 'sprite', mode: 'mix', file: fileNames.cake_batter, x: 4, y: 1 },
			ball_bearing_sprinkles:{ type: 'sprite', mode: 'mix', file: fileNames.cake_batter, x: 5, y: 1 },
			rainbow_sprinkles:     { type: 'sprite', mode: 'mix', file: fileNames.cake_batter, x: 6, y: 1 },
		},
		// Always draw:
		other: {
			bowl: { type: 'sprite', mode: 'mix', file: fileNames.cake_batter, x: 2, y: 0 }
		}
	},
	cookie_dough: {
		// Always draw:
		base: {
			root: quickComboTile(comboSpriteInfo.cookie_dough, 'mix', '#e2c49c', '#ad774b'),
		},
		// Draw once per count in modifiers:
		flavoring_modifiers: {
			...makeFlavorings(comboSpriteInfo.cookie_dough),
		},
		// Draw once if any quantity is present in modifiers:
		other_modifiers: {
			chocolate_chips:       { type: 'sprite', mode: 'mix', file: fileNames.cookie_dough, x: 0, y: 1 },
			white_chocolate_chips: { type: 'sprite', mode: 'mix', file: fileNames.cookie_dough, x: 1, y: 1 },
			dark_chocolate_chips:  { type: 'sprite', mode: 'mix', file: fileNames.cookie_dough, x: 2, y: 1 },
		},
		// Always draw:
		other: {
			bowl: { type: 'sprite', mode: 'mix', file: fileNames.cookie_dough, x: 2, y: 0 }
		}
	},
	cookie: {
		// Always draw:
		base: {
			root: quickComboTile(comboSpriteInfo.cookie_base, 'mix', '#e2c49c', '#ad774b')
		},
		// Draw once per count in modifiers:
		flavoring_modifiers: {
			...makeFlavorings(comboSpriteInfo.cookie_base),
		},
		// Draw once if any quantity is present in modifiers:
		other_modifiers: {
			chocolate_chips:       { type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 7, y: 1 },
			white_chocolate_chips: { type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 8, y: 1 },
			dark_chocolate_chips:  { type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 9, y: 1 },
		},
		// If there are decorations, draw them now:
		decorations: {
			frosting: { type: 'ref', value: 'cookie_frosting' },
			whipped_cream: quickComboTile(comboSpriteInfo.cookie_frosting, 'multiply', '#eeeff0', '#a0b7ba')
		},
		// If there are doodads, draw them now:
		doodads: {
			chocolate_chips:       { type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 0, y: 1 },
			white_chocolate_chips: { type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 1, y: 1 },
			dark_chocolate_chips:  { type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 2, y: 1 },
			chocolate_sprinkles:   { type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 3, y: 1 },
			white_sprinkles:       { type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 4, y: 1 },
			ball_bearing_sprinkles:{ type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 5, y: 1 },
			rainbow_sprinkles:     { type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 6, y: 1 },
			candy_corn:            { type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 0, y: 2 },
			hard_candy_eyeballs:   { type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 1, y: 2 },
			hard_candy_ghosts:     { type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 2, y: 2 },
			hard_candy_bats:       { type: 'sprite', mode: 'mix', file: fileNames.cookie, x: 3, y: 2 },
		}
	},
	cookie_frosting: {
		// Always draw:
		base: {
			root: quickComboTile(comboSpriteInfo.cookie_frosting, 'mix', '#f7f5f2', '#b7ada0'),
		},
		// Draw once per count in modifiers:
		flavoring_modifiers: {
			...makeFlavorings(comboSpriteInfo.cookie_frosting)
		}
	},
	cupcake: {
		// Always draw:
		base: {
			root: quickComboTile(comboSpriteInfo.cupcake_base, 'mix', '#f9ebcb', '#e0c074')
		},
		// Draw once per count in modifiers:
		flavoring_modifiers: {
			...makeFlavorings(comboSpriteInfo.cupcake_base),
		},
		// Draw once if any quantity is present in modifiers:
		other_modifiers: {
			chocolate_chips:       { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 7, y: 1 },
			white_chocolate_chips: { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 8, y: 1 },
			dark_chocolate_chips:  { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 9, y: 1 },
			chocolate_sprinkles:   { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 3, y: 1 },
			white_sprinkles:       { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 4, y: 1 },
			ball_bearing_sprinkles:{ type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 5, y: 1 },
			rainbow_sprinkles:     { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 6, y: 1 },
		},
		// If there are decorations, draw them now:
		decorations: {
			frosting: { type: 'ref', value: 'cupcake_frosting' },
			whipped_cream: quickComboTile(comboSpriteInfo.cupcake_frosting, 'multiply', '#eeeff0', '#a0b7ba')
		},
		// If there are doodads, draw them now:
		doodads: {
			chocolate_chips:       { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 0, y: 1 },
			white_chocolate_chips: { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 1, y: 1 },
			dark_chocolate_chips:  { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 2, y: 1 },
			chocolate_sprinkles:   { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 3, y: 1 },
			white_sprinkles:       { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 4, y: 1 },
			ball_bearing_sprinkles:{ type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 5, y: 1 },
			rainbow_sprinkles:     { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 6, y: 1 },
			candy_corn:            { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 0, y: 2 },
			hard_candy_eyeballs:   { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 1, y: 2 },
			hard_candy_ghosts:     { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 2, y: 2 },
			hard_candy_bats:       { type: 'sprite', mode: 'mix', file: fileNames.cupcake, x: 3, y: 2 },
		},
		// If the liner is specified, draw the specific one now; if none specified, draw "pale"
		liner: {
			pale:       quickComboTile(comboSpriteInfo.cupcake_liner, 'mix', '#e2e2e2', '#706c62'),
			lavender:   quickComboTile(comboSpriteInfo.cupcake_liner, 'mix', '#a29ad3', '#5b5779'),
			baby_blue:  quickComboTile(comboSpriteInfo.cupcake_liner, 'mix', '#9ab6d3', '#576779'),
			sky_blue:   quickComboTile(comboSpriteInfo.cupcake_liner, 'mix', '#9ad3d3', '#577973'),
			sage:       quickComboTile(comboSpriteInfo.cupcake_liner, 'mix', '#b2cb8d', '#607049'),
			lemongrass: quickComboTile(comboSpriteInfo.cupcake_liner, 'mix', '#d4e07b', '#797d50'),
			buttercup:  quickComboTile(comboSpriteInfo.cupcake_liner, 'mix', '#f3df7c', '#9a8b49'),
			tangerine:  quickComboTile(comboSpriteInfo.cupcake_liner, 'mix', '#ecbf7c', '#9c7736'),
			salmon:     quickComboTile(comboSpriteInfo.cupcake_liner, 'mix', '#d3a99a', '#825444'),
			blush:      quickComboTile(comboSpriteInfo.cupcake_liner, 'mix', '#d39aac', '#824457'),
			brown:      quickComboTile(comboSpriteInfo.cupcake_liner, 'mix', '#957d64', '#4e372d'),
			metal:      quickComboTile(comboSpriteInfo.cupcake_liner, 'mix', '#f9f9f9', '#302d26'),
			party: quickComboTile(comboSpriteInfo.cupcake_liner, 'mix', '#ffffff', '#8d8778', [
				{ type: 'sprite', mode: 'multiply', file: fileNames.cupcake, x: 6, y: 0 }
			]),
		}
	},
	cupcake_frosting: {
		// Always draw:
		base: {
			root: quickComboTile(comboSpriteInfo.cupcake_frosting, 'mix', '#f7f5f2', '#b7ada0')
		},
		// Draw once per count in modifiers:
		flavoring_modifiers: {
			...makeFlavorings(comboSpriteInfo.cupcake_frosting),
		},
	},
	cake: {
		// Always draw:
		base: {
			root: quickComboTile(comboSpriteInfo.cake_base, 'mix', '#f9ebcb', '#e0c074')
		},
		// Draw once per count in modifiers:
		flavoring_modifiers: {
			...makeFlavorings(comboSpriteInfo.cake_base)
		},
		// Draw once if any quantity is present in modifiers:
		other_modifiers: {
			chocolate_chips:       { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 0, y: 1 },
			white_chocolate_chips: { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 1, y: 1 },
			dark_chocolate_chips:  { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 2, y: 1 },
			chocolate_sprinkles:   { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 3, y: 1 },
			white_sprinkles:       { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 4, y: 1 },
			ball_bearing_sprinkles:{ type: 'sprite', mode: 'mix', file: fileNames.cake, x: 5, y: 1 },
			rainbow_sprinkles:     { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 6, y: 1 },
		},
		// If there are decorations, draw them now:
		decorations: {
			frosting: { type: 'ref', value: 'cake_frosting' },
			whipped_cream: quickComboTile(comboSpriteInfo.cake_frosting, 'multiply', '#eeeff0', '#a0b7ba')
		},
		// If there is a second layer of decorations, draw them now:
		// (If there is no frosting "layers support", draw these using the above info re: flavorings)
		piping: {
			frosting: { type: 'ref', value: 'cake_piping' },
			whipped_cream: quickComboTile(comboSpriteInfo.cake_piping, 'multiply', '#eeeff0', '#a0b7ba')
		},
		// If there are doodads, draw them this way if there was NO PIPING drawn:
		doodads_without_piping: {
			chocolate_sprinkles:   { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 10, y: 1 },
			white_sprinkles:       { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 11, y: 1 },
			ball_bearing_sprinkles:{ type: 'sprite', mode: 'mix', file: fileNames.cake, x: 12, y: 1 },
			rainbow_sprinkles:     { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 13, y: 1 },
			candy_corn:            { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 10, y: 3 },
			hard_candy_eyeballs:   { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 11, y: 3 },
			hard_candy_ghosts:     { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 12, y: 3 },
			hard_candy_bats:       { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 13, y: 3 },
			white_candied_flowers: { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 0, y: 3 },
			red_candied_flowers:   { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 1, y: 3 },
			yellow_candied_flowers:{ type: 'sprite', mode: 'mix', file: fileNames.cake, x: 2, y: 3 },
			blue_candied_flowers:  { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 3, y: 3 },
		},
		// ...But draw them this way if there WAS piping drawn:
		doodads_with_piping: {
			chocolate_sprinkles:   { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 10, y: 2 },
			white_sprinkles:       { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 11, y: 2 },
			ball_bearing_sprinkles:{ type: 'sprite', mode: 'mix', file: fileNames.cake, x: 12, y: 2 },
			rainbow_sprinkles:     { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 13, y: 2 },
			candy_corn:            { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 10, y: 4 },
			hard_candy_eyeballs:   { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 11, y: 4 },
			hard_candy_ghosts:     { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 12, y: 4 },
			hard_candy_bats:       { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 13, y: 4 },
			white_candied_flowers: { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 0, y: 3 },
			red_candied_flowers:   { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 1, y: 3 },
			yellow_candied_flowers:{ type: 'sprite', mode: 'mix', file: fileNames.cake, x: 2, y: 3 },
			blue_candied_flowers:  { type: 'sprite', mode: 'mix', file: fileNames.cake, x: 3, y: 3 },
		},
	},
	cake_frosting: {
		// Always draw:
		base: {
			root: quickComboTile(comboSpriteInfo.cake_frosting, 'mix', '#f7f5f2', '#b7ada0')
		},
		// Draw once per count in modifiers:
		flavoring_modifiers: {
			...makeFlavorings(comboSpriteInfo.cake_frosting),
		},
	},
	cake_piping: {
		// Always draw:
		base: {
			root: quickComboTile(comboSpriteInfo.cake_piping, 'mix', '#f7f5f2', '#b7ada0')
		},
		// Draw once per count in modifiers:
		flavoring_modifiers: {
			...makeFlavorings(comboSpriteInfo.cake_piping),
		},
	},
	cake_slice: {
		// Always draw:
		base: {
			root: quickComboTile(comboSpriteInfo.cake_slice_base, 'mix', '#f9ebcb', '#e0c074')
		},
		// Draw once per count in modifiers:
		flavoring_modifiers: {
			...makeFlavorings(comboSpriteInfo.cake_slice_base)
		},
		// Draw once if any quantity is present in modifiers:
		other_modifiers: {
			chocolate_chips:       { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 0, y: 1 },
			white_chocolate_chips: { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 1, y: 1 },
			dark_chocolate_chips:  { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 2, y: 1 },
			chocolate_sprinkles:   { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 3, y: 1 },
			white_sprinkles:       { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 4, y: 1 },
			ball_bearing_sprinkles:{ type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 5, y: 1 },
			rainbow_sprinkles:     { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 6, y: 1 },
		},
		// If there are decorations, draw them now:
		decorations: {
			frosting: { type: 'ref', value: 'cake_slice_frosting' },
			whipped_cream: quickComboTile(comboSpriteInfo.cake_slice_frosting, 'multiply', '#eeeff0', '#a0b7ba')
		},
		// If there is a second layer of decorations, draw them now:
		// (If there is no frosting "layers support", draw these using the above info re: flavorings)
		piping: {
			frosting: { type: 'ref', value: 'cake_slice_piping' },
			whipped_cream: quickComboTile(comboSpriteInfo.cake_slice_piping, 'multiply', '#eeeff0', '#a0b7ba')
		},
		// If there are doodads, draw them this way if there was NO PIPING drawn:
		doodads_without_piping: {
			chocolate_sprinkles:   { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 10, y: 1 },
			white_sprinkles:       { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 11, y: 1 },
			ball_bearing_sprinkles:{ type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 12, y: 1 },
			rainbow_sprinkles:     { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 13, y: 1 },
			candy_corn:            { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 10, y: 3 },
			hard_candy_eyeballs:   { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 11, y: 3 },
			hard_candy_ghosts:     { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 12, y: 3 },
			hard_candy_bats:       { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 13, y: 3 },
			white_candied_flowers: { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 0, y: 3 },
			red_candied_flowers:   { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 1, y: 3 },
			yellow_candied_flowers:{ type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 2, y: 3 },
			blue_candied_flowers:  { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 3, y: 3 },
		},
		// ...But draw them this way if there WAS piping drawn:
		doodads_with_piping: {
			chocolate_sprinkles:   { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 10, y: 2 },
			white_sprinkles:       { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 11, y: 2 },
			ball_bearing_sprinkles:{ type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 12, y: 2 },
			rainbow_sprinkles:     { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 13, y: 2 },
			candy_corn:            { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 10, y: 4 },
			hard_candy_eyeballs:   { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 11, y: 4 },
			hard_candy_ghosts:     { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 12, y: 4 },
			hard_candy_bats:       { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 13, y: 4 },
			white_candied_flowers: { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 0, y: 3 },
			red_candied_flowers:   { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 1, y: 3 },
			yellow_candied_flowers:{ type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 2, y: 3 },
			blue_candied_flowers:  { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 3, y: 3 },
		},
	},
	cake_slice_frosting: {
		// Always draw:
		base: {
			root: quickComboTile(comboSpriteInfo.cake_slice_frosting, 'mix', '#f7f5f2', '#b7ada0')
		},
		// Draw once per count in modifiers:
		flavoring_modifiers: {
			...makeFlavorings(comboSpriteInfo.cake_slice_frosting),
		},
	},
	cake_slice_piping: {
		// Always draw:
		base: {
			root: quickComboTile(comboSpriteInfo.cake_slice_piping, 'mix', '#f7f5f2', '#b7ada0')
		},
		// Draw once per count in modifiers:
		flavoring_modifiers: {
			...makeFlavorings(comboSpriteInfo.cake_slice_piping),
		},
	},
	frosting: {
		// Only draw if NO modifiers!
		plain: {
			root: quickComboTile(comboSpriteInfo.frosting, 'mix', '#f7f5f2', '#b7ada0')
		},
		// Only draw if there ARE modifiers!
		base: {
			root: { ...comboSpriteInfo.frosting.light, type: 'sprite', mode: 'mix', colorize: '#f7f5f2' },
		},
		// Draw once per count in modifiers:
		flavoring_modifiers: {
			...makeFlavorings(comboSpriteInfo.frosting),
		},
		// If `cocoa_powder` is present in modifiers, draw `chocolate_jar`
		// Otherwise, draw `no_chocolate_jar`
		jar: {
			chocolate_jar: { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 1, y: 0 },
			no_chocolate_jar: { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 2, y: 0 },
		},
		// If flavor count == 0 use the `plain` decal
		// If flavor count == 1, use the decal for that flavor
		// If flavor count 1> and it's all the same flavor, use the decal for that flavor
		// If flavor count == 2 and 1 is chocolate and 1 is something else, use the decal for the something else
		// Otherwise use the `plain` decal
		decals: {
			cherry_flavoring:     { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 0, y: 1 },
			raspberry_flavoring:  { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 1, y: 1 },
			strawberry_flavoring: { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 2, y: 1 },
			orange_flavoring:     { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 3, y: 1 },
			almond_flavoring:     { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 4, y: 1 },
			caramel_flavoring:    { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 5, y: 1 },
			lemon_flavoring:      { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 6, y: 1 },
			lime_flavoring:       { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 7, y: 1 },
			mint_flavoring:       { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 8, y: 1 },
			blueberry_flavoring:  { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 9, y: 1 },
			ube_flavoring:        { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 10, y: 1 },
			grape_flavoring:      { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 11, y: 1 },
			cocoa_powder:         { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 12, y: 1 },
			plain:                { type: 'sprite', mode: 'mix', file: fileNames.cake_slice, x: 13, y: 1 },
		}
	},
	cream: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 0, y: 0 }}},
	egg: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 1, y: 0 }}},
	chocolate_chips: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 2, y: 0 }}},
	white_chocolate_chips: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 3, y: 0 }}},
	dark_chocolate_chips: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 4, y: 0 }}},
	chocolate_bar: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 5, y: 0 }}},
	white_chocolate_bar: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 6, y: 0 }}},
	dark_chocolate_bar: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 7, y: 0 }}},
	chocolate_sprinkles: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 8, y: 0 }}},
	white_sprinkles: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 9, y: 0 }}},
	ball_bearing_sprinkles: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 10, y: 0 }}},
	rainbow_sprinkles: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 11, y: 0 }}},
	blue_candied_flowers: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 0, y: 1 }}},
	red_candied_flowers: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 1, y: 1 }}},
	yellow_candied_flowers: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 2, y: 1 }}},
	white_candied_flowers: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 3, y: 1 }}},
	hard_candy_bats: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 4, y: 1 }}},
	hard_candy_ghosts: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 5, y: 1 }}},
	hard_candy_eyeballs: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 6, y: 1 }}},
	candy_corn: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 7, y: 1 }}},
	pastry_cream: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 0, y: 2 }}},
	whipped_cream: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 1, y: 2 }}},
	sugar: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 2, y: 2 }}},
	cocoa_powder: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 3, y: 2 }}},
	flour: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 4, y: 2 }}},
	chocolate_bar_naked: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 5, y: 2 }}},
	cherry_flavoring: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 0, y: 4 }}},
	raspberry_flavoring: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 1, y: 4 }}},
	strawberry_flavoring: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 2, y: 4 }}},
	orange_flavoring: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 3, y: 4 }}},
	almond_flavoring: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 4, y: 4 }}},
	caramel_flavoring: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 5, y: 4 }}},
	lemon_flavoring: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 6, y: 4 }}},
	lime_flavoring: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 7, y: 4 }}},
	mint_flavoring: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 8, y: 4 }}},
	blueberry_flavoring: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 9, y: 4 }}},
	ube_flavoring: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 10, y: 4 }}},
	grape_flavoring: {base:{root: { type: 'sprite', mode: 'mix', file: fileNames.other, x: 11, y: 4 }}},
};

console.log(data);

console.log('Draw tile info generated!')