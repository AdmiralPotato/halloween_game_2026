# Notes for the prototype

## Buying, selling, timing

- Currently these values are only "tiers." E.g. flour and sugar are cheap and cost about the same (as opposed to the very expensive candied flowers) so both have the value of 1 right now.
- Products are made in batches of 12 for cookies, and 6 for muffins, and 1 for cake. But they are interacted with all together as a single item until they are made available for sale, after which customers might buy a quantity less than the batch size.

## Items

- Types:
	- Ingredient: food; something used to cook or bake or make something else.
	- Product: food; like ingredients, but can be "finished" with a finisher like filling or decorations, and can be sold.
	- Pan: required to cook something (primarily to distinguish cupcakes and cakes)
		- May be empty, or may contain an ingredient or a product.
- Every item has its own cost (if available for sale), categories (e.g. filling or doodad), and type of storage (e.g. crate, fridge, bag)
- Some items belong to a variant, e.g. cherry flavoring is a variant of flavoring, rainbow sprinkles are a variant of sprinkles.
	- When looking for an item (e.g. to order from the store, or for looking up what an item is compatible with), you might need either the variant's name or its parent's name.
- Items can stack if their identity matches: their name and their modifier names. Quantities need not match.

### Categories

Each item can belong to one or more categories (though usually only one):

- Base: (should rename to ingredient? though many of these others might also be ingredients)
- Modifier: something only used to change the attributes of something else, e.g. cherry flavoring
- Finisher: can only be applied to a product (e.g. cookie) not an ingredient (e.g. cookie dough).
	- Finishers are picked up and held, then used on something on the countertop (or on a decorating platform for a speed bonus)
	- Each type of product can only take certain finishers. E.g. cookies cannot be injected with fillings like pastry cream (like for eclairs)
	- Types:
		- Filling: can be used to inject into a product
		- Decoration: can be applied to the outside of a product
		- Doodad: countable noun (not mass noun) that can be applied to a product, but only if there's a decoration to adhere to (e.g. can't add sprinkles without frosting)
- Pan

### Attribute

- Any food item has innate attributes. 
- Mixed ingredients have the attributes of their ingredients.
- Varying the final attributes of your products increase (to a point) their appeal, and varying the attributes of your product line increases the appeal to your shop.
- Each layer of a product (base, filling, decoration, doodads) have their own aggregate score, and the product itself is evaluated by the spread of these values rather than summing them.
- Types:
	- Color: pale can be negative (dark); red, orange, brown, yellow, green, blue, purple, varigated (multicolored) are >0.
	- Texture: moist, soft, crumbly values can all be negative (dry, hard, sticky); pop is >0
	- Flavor: nutty, savory, chocolatey, fruity, minty, salty, sweet, tart, floral are >0

## Recipes

- Recipes are a series of ingredients and allowed modifiers for an applicance (like cutting board or oven).
- Output may be more than 1 item, e.g. cream -> 3x whipped cream.
- The output's attributes are the sum of its ingredients, but it may add additional values to the output, e.g. pale:-1 for the maillard reaction.
- There might be more than one recipe per output.

## Tiles

### Appliance Tile

- Types:
	- Oven: kept separately because it can only take 1 item at a time, and of only one type: pan.
	- Mixer
	- Cutting board

### Storage Tile

- Types:
	- Bag: e.g. flour
	- Fridge: e.g. eggs
	- Freezer: e.g. ice cream (LATER)
	- Crate: e.g. bulk chocolate bars
	- Jar: e.g. flavoring
- Interact with a storage tile to withdraw 1 of the items.
- If holding that same kind of item, interacting will instead store 1 of the item.
- Any single item may also be stored on a countertop regardless of whether it needs refrigeration.
- Unlike in Overcooked, nothing can be placed on a storage tile.
- If the ingredient count runs out, they become empty, but retain their type.
	- Anything compatible might be stored inside instead afterward.

### Miscellaneous

- Countertop: your workspace. Things can be set down on them.
- Delivery zone: drop products here to make them available for sale.
- Trash: items dropped here go away (except pans).

## Other notes

- Apart from pans, all other dishes appear and disappear when appropriate. No dirty dishes.

## TODO

- Trash can
- Means for buying empty storage container
- Adding finishers again
- Selling for money
	- Determine auto cost for items
- Put source data into JSON files
- More unit tests (boo)
