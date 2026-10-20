# Notes for the prototype

## Buying, selling, timing

- Currently these values are only "tiers." E.g. flour and sugar are cheap and cost about the same (as opposed to the very expensive candied flowers) so both have the value of 1 right now.
- Products are made in batches of 12 for cookies, and 6 for muffins, and 1 for cake. But they are interacted with all together as a single item until they are made available for sale.

## Items

- Types:
	- Ingredient: food; something used to cook or bake or make something else.
	- Product: food; like ingredients, except they can be "finished" with a finisher like filling or decorations, and can be sold.
	- Container: may be empty, or may contain something.
		- Pan: required to cook something (primarily to distinguish cupcakes and cakes)
		- Filling injector: required to add filling (primarily to distinguish whipped cream as filling or a decoration)
- Every item has its own cost (if available for sale at the warehouse), categories (e.g. filling, doodad, base, modifier), and type of storage dispenser block (e.g. crate, fridge, bag)
- Some items belong to a variant, e.g. cherry flavoring is a variant of flavoring, rainbow sprinkles are a variant of sprinkles.
	- When looking for an item (e.g. to order from the warehouse vs for looking up what an item is compatible with), you might need either the variant's name or its parent's name.
- Stacking:
	- Items can stack if their identity matches: their name and their modifier names. Quantities need not match.
	- Exception: containers full of something cannot stack with more containers with the same contents; containers can only stack when empty.

### Categories

Each item can belong to one or more categories (though usually only one):

- **Base**: a core component of a recipe, e.g. flour, eggs, sugar
- **Modifier**: something only used to change the attributes of something else, e.g. cherry flavoring, cocoa powder
- Finisher: can only be applied to a product (e.g. cookie) not an ingredient (e.g. cookie dough).
	- Finishers are picked up and held, then used on something on the countertop (or on a decorating platform for a speed bonus); some finishers may need to be contained in an applicator depending on target layer.
	- Each type of product can only take certain finishers. E.g. sugar cookies cannot be injected with fillings like pastry cream (like for eclairs)
	- Types:
		- **Filling**: contained inside in the pastry
		- **Decoration**: the outside layer, e.g. frosting
		- **Doodad**: countable noun (not mass noun) that can be applied to a product, but only if there's a decoration layer to adhere to (e.g. can't add sprinkles to a sugar cookie without frosting)
- Container
	- **Pan**
	- **Filling injector**

### Root item vs innermost item

- Innermost item means the pan's contents rather than the pan. Sometimes, when interacting with something, you need one rather than the other, e.g. if you have sprinkles on a pan and cookies on the counter, interacting with cookies will consider the sprinkles, not the pan; interacting with the cookies when holding an empty pan would consider the pan instead.
- Innermost:
	- Pan<Food> => Food
	- Pan<> => Pan<>
	- Food => Food
- Root:
	- Pan<Food> => Pan<Food>
	- Pan<> => Pan<>
	- Food => Food

### Attribute

- Any food item has innate attributes based on what it is or what recipe was used to make it.
- Varying the final attributes of your products increase (to a point) their appeal, and varying the attributes of your product line increases the appeal to your shop.
- Each layer of a product (base, filling, decoration, doodads) have their own aggregate score, and the product itself is evaluated by the spread of these values rather than the sum of them.
- Types:
	- Color: pale can be negative (dark); red, orange, brown, yellow, green, blue, purple, varigated (multicolored) are positive values only.
	- Texture: moist, soft, crumbly values can all be negative (dry, hard, sticky); pop is positive values only
	- Flavor: nutty, savory, chocolatey, fruity, minty, salty, sweet, tart, floral are positive values only

## Recipes

- Recipes are a series of ingredients and allowed modifiers. They require an applicance (like cutting board or oven).
- Output may be more than 1 item, e.g. cream -> 3x whipped cream.
- The output's attributes are the sum of its ingredients, but it may add additional values to the output, e.g. pale:-1 for the maillard reaction.
- There might be more than one recipe per type of base output.

## Tiles

### Appliance Tile

- Oven: kept separately because it can only take 1 item at a time, and of only one type: pan.
- Appliances:
	- Types:
		- Mixer
		- Cutting board
	- May only contain food, not containers
	- May contain more than 1 thing
	- Once there is more than one thing inside, none of it may be retrieved

### Storage Tile

- Types:
	- Bag: e.g. flour
	- Fridge: e.g. eggs
	- Freezer: e.g. ice cream (LATER)
	- Crate: e.g. bulk chocolate bars
	- Jar: e.g. flavoring
- With empty hands, interact with a storage tile to withdraw 1 of the items.
- If holding that same kind of item, interacting will instead store 1 of the item.
- (Any single item may also be stored on a countertop regardless of whether it needs refrigeration; items not in use need not only be stored in a storage tile.)
- Unlike in Overcooked, nothing can be placed on top of a storage tile.
- If the ingredient count runs out, they become empty, but retain their type (fridge, crate, jar).
	- Anything that uses that storage type might be stored inside instead afterward, not just the original item again.

### Miscellaneous

- Countertop: your workspace. Things can be set down on it.
	- Items with identical modifiers and modifier count can stack on the same tile, but only to a point, depending on what the base item is.
- Delivery zone: drop products here to make them available for sale.
	- The batch size will come into play here. One batch of cookies becomes 12 individual items.
- Trash: items dropped here go away (except containers).

## Other notes

- Apart from container items, all other dishes appear and disappear when appropriate. No dirty dishes.
	- E.g. pick up whipped cream from the mixer and it appears in your hand inside a bowl. Set it down on a counter, still in a bowl. Put it into a filling injector and the bowl disappears.
- You might be able to buy crates of finished products, like lollipops, bought en masse and sold for a little markeup.

## TODO

- Using filling injectors as a finisher
- Means for buying empty storage container
- Selling for money
	- Determine auto cost for items
- Put source data into JSON files
- More unit tests (boo)
- Change some orange things to brown
- Countertop stacks have a size limit; storage boxes don't! (thanks Solra)

### Stretch goals

- fryer, donuts
- saucepan, jam
- white chocolate
- red chocolate (for vampires)
- gold leaf (dragons and kobolds love this)

### Questions

- If items on the countertop can stack, why have storage boxes?

# GODOT SCRIPT VERSION

- Object: don't inherit this directly
	- RefCounted: for objects that don't live in the scene
		- Food
	- Node: for objects that do live in the scene
		- Node2D: for objects that live in the 2D world in the scene
		- Node3D: for objects that live in the 3D world in the scene
			- Item
				- Ingredient (encapsulates one food, its sole child)
				- Product (encapsulates one or more food, its children)
				- Container
					- Pan
					- That One Injector That's A Special Case
