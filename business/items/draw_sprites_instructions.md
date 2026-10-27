# Draw tiles instructions

(Painter's algorithm)

## `frosting` (i.e. the tubs)

1. Always draw:
	- If no modifiers, draw: `frosting.plain.root`
	- Otherwise, draw: `frosting.base.root`
2. Draw once per count in modifiers: `frosting.flavoring_modifiers[name]`
3. Always draw:
	- If `cocoa_powder` is present in modifiers, draw `frosting.jar.chocolate_jar`
	- Otherise, draw: `frosting.jar.no_chocolate_jar`
4. Pick one decal and draw: `frosting.decals[name]`
	- If flavor count == 0 use the `plain` decal
	- If flavor count == 1, use the decal for that flavor
	- If flavor count 1> and it's all the same flavor, use the decal for that flavor
	- If flavor count == 2 and 1 is `cocoa_powder` and 1 is something else, use the decal for the something else
	- Otherwise use the `plain` decal

## `cake_batter`

1. Always draw: `cake_batter.base.root`
2. Draw once per count in modifiers: `cake_batter.flavoring_modifiers[name]`
3. Draw once if any quantity is present in modifiers: `cake_batter.other_modifiers[name]`
4. Always draw: `cake_batter.other.bowl`

## `cookie_dough`

1. Always draw: `cookie_doughbase.root`
2. Draw once per count in modifiers: `cookie_dough.flavoring_modifiers[name]`
3. Draw once if any quantity is present in modifiers: `cookie_dough.other_modifiers[name]`
4. Always draw: `cookie_doughother.bowl`

## `cookie`

1. Always draw: `cookie.base.root`
2. Draw once per count in modifiers: `cookie.flavoring_modifiers[name]`
3. Draw once if any quantity is present in modifiers: `cookie.other_modifiers[name]`
4. Draw decorations (if any): `cookie.decorations[name]`
5. Draw doodads (if any): `cookie.doodads[name]`

## `cookie_frosting`

1. Always draw: `cookie_frosting.base.root`
2. Draw once per count in modifiers: `cookie_frosting.flavoring_modifiers[name]`

## `cupcake`

1. Always draw: `cupcake.base.root`
2. Draw once per count in modifiers: `cupcake.flavoring_modifiers[name]`
3. Draw once if any quantity is present in modifiers: `cupcake.other_modifiers[name]`
4. Draw decorations (if any): `cupcake.decorations[name]`
5. Draw doodads (if any): `cupcake.doodads[name]`
6. Draw liner: `cupcake.liner[name]`
	- If no liner is specified, draw "pale" (`cupcake.liner.pale`)

## `cupcake_frosting`

1. Always draw: `cupcake_frosting.base.root`
2. Draw once per count in modifiers: `cupcake_frosting.flavoring_modifiers[name]`

## `cake`

1. Always draw: `cake.base.root`
2. Draw once per count in modifiers: `cake.flavoring_modifiers[name]`
3. Draw once if any quantity is present in modifiers: `cake.other_modifiers[name]`
4. Draw decorations (if any): `cake.decorations[name]`
5. If there are a second "layer" of decorations, draw them now: `cake.piping[name]`
	- If there is no frosting "layers support" yet, repeat step #4 but with these tiles instead
6. Draw doodads (if any):
	- If step #5 was drawn, use these: `cake.doodads_with_piping[name]`
	- Otherwise use these: `cake.doodads_without_piping[name]`

## `cake_frosting`

1. Always draw: `cake_frosting.base.root`
2. Draw once per count in modifiers: `cake_frosting.flavoring_modifiers[name]`

## `cake_piping`

1. Always draw: `cake_piping.base.root`
2. Draw once per count in modifiers: `cake_piping.flavoring_modifiers[name]`

## `cake_slice`

1. Always draw: `cake_slice.base.root`
2. Draw once per count in modifiers: `cake_slice.flavoring_modifiers[name]`
3. Draw once if any quantity is present in modifiers: `cake_slice.other_modifiers[name]`
4. Draw decorations (if any): `cake_slice.decorations[name]`
5. If there are a second "layer" of decorations, draw them now: `cake_slice.piping[name]`
	- If there is no frosting "layers support" yet, repeat step #4 but with these tiles instead
6. Draw doodads (if any):
	- If step #5 was drawn, use these: `cake_slice.doodads_with_piping[name]`
	- Otherwise use these: `cake_slice.doodads_without_piping[name]`

## `cake_slice_frosting`

1. Always draw: `cake_slice_frosting.base.root`
2. Draw once per count in modifiers: `cake_slice_frosting.flavoring_modifiers[name]`

## `cake_slice_piping`

1. Always draw: `cake_slice_piping.base.root`
2. Draw once per count in modifiers: `cake_slice_piping.flavoring_modifiers[name]`