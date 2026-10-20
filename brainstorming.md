# Halloween Game 2026

## Goals

1. Game jam: make a simgle, "good enough" game quickly
	1. Keep scope creep MINIMAL
	2. Iterate quickly
	3. Get something playable ASAP
	4. Mini marathon
2. Practice Godot
3. Practice division of labor
	1. Meiko: design and logical prototypes
	2. Corfid: artist
	3. Solra: programmer
	4. Admiral: technical artist/programmer/build pipeline
	5. Grissess: programmer
4. Halloween-themed
	1. Release by end of month with some fanfare various places
		- SLC Game Dev Group


## Brainstorming

- Recipies!
	- Fantasy ingredients?
	- Simple / proceedural recipies?

- Goat Pats = Plus Stats

- Factory / automation?

- Idle game?
	- Can have periods of "auto-pilot" where you can watch your restaurant function?
	- Proceedural graphics presentation of idle game mechanics (like _Unnamed Space Idle_)?

- Tower Defense?
	- tower defense but the monsters you defeat turn into ingredients that you cook
	- cooking different dishes attracts different monsters
	- available space to perform tower defense or cooking setup is not limited by the map you're on, you just purchase a parallel universe of a certain map/kitchen so if it's an optimal map for producing different/conflicting things, you can, and the results (monster parts or the cooked dishes) come out into the main universe to sell

- Harvesting ingredients?
	- You have a garden where the plants are the towers and you hire the critters to harvest them for you
	- The critters approach hungry and you need to feed them, the towers are buffet style stations
	- it's just an endless queue of critters and you feed as many as you can and that's your score/income like in chef knight

- ~~Defeating monsters for ingredients?~~

- Have a storefront / series of storefronts?
	- starting out as a small time shop with limited production floor space and inventory capacity
	- you set prices for your inventory and that affects the rate it gets bought
	- you buy neighboring shops to expand your operation
	- if inventory is offscreen, it can transition from "candy store people walk into" to "warehouse that candy store owners buy truckloads from" without much effort on our part

- Product delivery system:
	- _Plate Up!_'s buffet system
	- Fulfilling specific customer orders?

- Upgrade system?
	- Sanctum- (or Rise to Ruins-) style individual upgrades, BUT every time you do a certain upgrade it becomes cheaper to do it again

- Storefront game?

- _Harvest Moon_'s shipping box
	- You set completed products in the box and they magically disappear and your [income] goes up

- Types of candies
	- Hard candies (Jolly Rancher)
	- Soft candies (Tootsie Roll)
	- Stick candies (suckers)
	- Bar candies (KitKat)
	- Packaged pastries (Twinkie)
	- Gummies (gummy bears)
- Types of pastries / cookies
	- Monocomposite cookies (sugarcookies)
	- Conglomerate cookies (chocolate chip / rasin cookies)
	- Stuffed (cream puffs)
	- Doughnuts
- Types of ice creams
	- Mostly vary in flavor
	- Swirled mix flavors
	- With solid ingredients mixed in
	- Toppings variable
- Types of… cakes?
	- ???
- Remember, none of these need to resemble reality. We are in a fantasy setting! Magic and stuff! We can get silly!

## Ideas

- Genre
- Gameplay loop
- Graphics (2D, 3D, sprites, color scripting)
	- 3D environment
	- 3D characters
	- 2D or 3D ingredients?
		- Could go either way, but we should pick one
	- 2D products
		- like _Breath of the Wild_
		- We can draw lots of kinds of foods much more easily than we can 3D model / texture / shader lots of kinds of foods


## Research

### Types of food prep

- Candies (easiest)
- Pastries / cookies (more complicated)
- Cakes (most complicated) / (easiest to mess up)

- Baking
	- More reliant on following exact recipe
- Cooking
	- Good timing is more important (rhythm game?)
	- Can wing it (range of success states)
- Decorating
	- Spreading buttercream frosting or laying fondant
	- Piping frosting or whipped cream
	- Decorating with candy shapes (e.g. eyes on a ghost), sprinkles, candied flowers

### Candymaking

- Mostly involves bringing things to temperature
	- Often you need to hit a temperature then bring it down a little and keep it within a range
- Jelly beans
	- Make a sugar syrup, then put into molds.
	- Dust with powdered sugar.
	- Polish to a shine with wax in an industrial roller.
- Chocolate
	- Tempered chocolate
		- Shiny, does not melt in hand
		- To make, it must be  brought within certain temperature ranges at different points in time, several times in a row
		- Adding a "seed crystal" helps get it started
		- This is a pain to do, even for pros
- Hard candies, see [Lofty Pursuits](https://www.youtube.com/@LoftyPursuits)
	- Boil sugar mix
	- Cooling table
		- Add colors, flavors, and sourness
		- Cut and mix, then knead
		- To make opaque / pale (or white), pull on a taffy hook to add air
	- To finish:
		- Drops:
			- Put through a roller machine, often with molded shapes
			- Drop the candy to split them apart
			- Waste product: candy sprinkles or dust
		- Image candy:
			- Arrange colors into a very thick log
			- On one side, roll until the desired diameter
			- Keep the log rolling regularly so the shape doesn't sink and distort
			- When hard, push over the edge of the table and rapidly cut into small segments
			- Waste product: "unicorn dropping," the fat end of the original log, sold individually, shaped like a very tall Hershey's kiss

## Gameplay

### Gist

- Halloween bakery
- Types of order
	- "from inventory" Make at your discretion, product are available for randos to purchase behind the counter / under the glass
	- "special order" Made to order, very complex order, **no time limit** (e.g. special ordering a wedding cake)
	- ~~"from menu" Made to order, eat on site (time limit)~~
- Ingredients
	- Can order more, slight realtime delay (e.g. 90 seconds, vs next "game day")
- Assets:
	- Ingredients and products: 2D
	- Characters and environment: 3D
- Touchscreen button paradigm
- Possible upgrades / purchases:
	- Auto reorder when low
		- Per ingredient? So every piece of this operation is upgradable?
	- Quantity of special order items available at once (parallelize!)
	- Types of ingredients available
	- Faster shipping
	- Better bulk deals for ingredients
	- "Advertising" (increases demand)
	- Storefront size?
	- Catering (selling products in bulk)
	- Hand kneading -> Kitchen Aid mixer
	- Plastic decorations (e.g. plastic spiders to stick on the top of cupcakes)
- Actual customers walking by, speech bubbles say what they were thinking ("too expensive" "oh, I would have paid double") YES
	- Could start simple, but a good place to pour polish
- Front display case categories
	- Frozen
	- Fridge
	- Shelf stable
	- Basket
- Questions
	- Items can spoil? NO
	- Items can be fresh? nah
	- Items need refrigeration for storage? Just in terms of where ingredients live
	- Disasters? NO DAWG ("oh uh! weavils in your flour! lose 30% of stock")
- Other ideas
	- Events:
		- e.g. "Heat Wave!" Frozen goods more selling (and the inverse)

### Game loop

- Plate Up, Overcooked: you're a little guy, can hold up a thing, there are things in the room
- Products
	- Product count limited by size of cabinet and size of products
	- You make these
- In the room:
	- Ingredients
	- Cooking appliances
	- Work space / countertop space
	- Baking layout rearrangable
	- Can unlock new ingredients and appliances
	- Can upgrade appliances
- Storefront is a display glass thingie
	- Frozen area, cold area, room temp area
	- Can change the proportions, slider-style
	- Customers walk past, contemplate, optionally buy something, and leave while saying what they thought of the price
- Baking steps
	- Pick up ingredient
	- Move ingredient to place
	- Do a thing to it (X times) or wait an amount of time
	- Combine the above steps; combine items
	- Bring item to anywhere in the front
- Can buy in bulk low quality products to sell individually at profit to get started ?
	- would allow having a variety of products while only being able to *make* one
	- would give an escape valve so you can make "a little money" when your pipelinei is otherwise inoperable
- Set prices? (undecided, stretch goal?)
- Employees? (stretch goal)
	- Golems?
	- Goblins?
	- Oompa-Loompas?
	- familiars?
	- "Doers" and "Bringers"?
- No day/night, but can have events:
	- mundane events: heat wave, cold wave, fads, holidays
	- fantasy events: lava rain?
- Special order slots:
	- Start with 1, can unlock more
	- Time pressure? (Fixed) Time bonus if done fast (we want low pressure)
- What kind of goods?
	- Modifiers
		- Coloring
		- Flavors
		- Filling
			- Sweet custard
			- Jelly
			- Cream
		- Toppings
			- Candy
			- Fruit
			- Candied flowers
			- Frosting
	- Baked goods: YES
		- Cookies
		- Cupcakes
			- Can control wrapper appearance
		- Big cakes
			- Whole and sliced
		- Donuts
		- Bread
		- Crepes
		- Sweet bread (not to be confused with sweetbread, which is a meat)
		- Pie
			- Pumpkin pie
			- Crumble pie (fruit)
			- Cream pie (fruit, custard)
	- Candy: ???
		- Even if not present as an end product, we could have candies as ingredients
	- Ice cream: ???
	- Meats: ???
	- Sushi: ????????
	- Chaaaaaaaps: ???

candy corn cookies have to go in, they should maybe even be the ICON

### Anatomy of a pastry

- Crust
	- Main crust, full containment (eclair)
	- Main crust, a circle (donut)
	- Main crust, open top (pumpkin pie, key lime pie)
	- Main crust, with different top crust (fruit pies)
	- Main crust, flat (crepe)
	- Main crust, flat, rolled (croissant)
- Filling?
	- required for open top / different top crust, optional for containment / circle / croissant, forbidden for crepe?
- Frosting?
- Decoration?

### Anatomy of candy

- Sugar
- Non-sugar ingredients
- Temperature
	- the temperature range you bring the candy mix to decides what kind of candy you get

