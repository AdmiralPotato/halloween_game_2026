# Design Doc

- You are a little guy
- You can pick things up and set them down

## Screen zones

- Top: baking area
	- Ingredient source blocks
	- Countertops and appliances
	- Layout is customizable
- Middle: display counter
	- Drop finished products off to make them available for sale
	- On one end is the "special order" tray(s)
	- Product count limited by cabinet size and product size
	- Frozen, cold, and room temp areas
		- Can change the proportions, slider-style
	- Countertop area (for prepackaged extras, like candy)
- Bottom: customers
	- Customers walk past, contemplate, optionally buy something, and leave while saying what they thought of the price or product
- Possibly also: "back room" for additional storage or retired equipment

## Gameplay

- Baking steps:
	- Pick up ingredient, bring it to a place
	- Do a thing to it (X times) or wait an amount of time
	- Bring finished product to the display cabinet
- Customers make purchases on their own
- Ingredients must be restocked after being used up
	- Slight delay for delivery (like Out of Space)
	- Some ingredients may be made by hand
- Sell prices are fixed per recipe
	- Can choose a "sale" item that's marked down slightly
- Demand increases/decreases according to events or fads e.g. heat wave, holidays
- Special orders bring more extra money but might require more attention or new ingredients
	- Complete the order within a time window for a bonus tip (fixed amount, not prorated based on time remaining)
- Receive notices:
	- X is running low!
	- X is suddenly popular!
	- X sold out!
- Cooking trays and dishes appear in hand and disappear when appropriate
	- No dirty dishes, no washing up, no trays/pans/pots to manage
- Can save finished product "recipe" and give it a name

## Progression

- Make workspace bigger
- Order new appliances or upgrade existing appliances
- Unlock new ingredients
- Buy or unlock new product recipes
- Upgrade shop features
	- More "special order" slots
	- More display cabinet space
	- Catering orders (special orders with multiple items per order)
- Monetary improvements
	- Better shop signage (improve global demand)
	- Ad space (temporarily increased demand)
	- Bulk order discounts for ingredients
- QOL features
	- Calendar for upcoming holidays
	- Weather forecast
	- Auto reorder when low (per item(?))
	- Expedited ingredient shipping (global)

## Appeal

- The shop attracts more customers the more the product attributes vary
- But certain customers might be in the mood for certain attributes or certain ratings
- Attributes:
	- Colors:
		- Light vs Dark
		- Red
		- Orange
		- Yellow
		- Green
		- Blue
	- Textures:
		- Dry vs Moist
		- Soft vs Hard
		- Sticky vs Crumbly
		- Pop (heterogeneous, like sprinkles or candy decorations)
	- Flavors:
		- Savory
		- Buttery
		- Chocolatey
		- Fruity
		- Minty
		- Salty
		- Nutty
		- Sweet (it's all sweet, but this is, like, extra)
- Rating: Chaos vs unity
	- Fewer attributes means higher unity
	- More attributes means higher chaos
- Rating: Simplicity vs luxury
	- Lower scoring attributes means higher simplicity
	- Higher scoring attributes means higher luxury
- Each product "layer" gets the attributes summed, which may cancel some out, e.g. pale + dark
	- Layers:
		- Base (includes "base" modifiers)
		- Filling (does not contribute to shop visual appeal)
		- Decoration
		- Doodads (requires decoration to be present)

## Food

- Ingredients must have a place to be stored before purchase/storage
	- Some purchases come with their own storage container
- Storage types:
	- Bag (on the ground, e.g. flour)
	- Box (on the ground)
	- Fridge
	- Countertop container (e.g. sprinkles)
	- Filling injector (looks like a pointy piping bag)
- When empty, the box/bag/etc can be used for anything

### Aspects of a product

- Main ingredients
	- Modifiers: optional ingredients
- Cooking/baking location and time
- OPTIONAL: post-bake fillings (e.g. ice cream, pastry cream, jelly)
- OPTIONAL: decorations (e.g. frosting)
- OPTIONAL: doodads (e.g. sprinkles, candy shapes)
	- Requires any base decoration to be present

### Ingredients: consumable

Start with stock of: flour, sugar, chocolate bar, plain frosting

- **Flour**
	- Storage: bag
	- Sources: BUY $
- **Sugar**
	- Storage: bag
	- Sources: BUY $
- **Egg**
	- Storage: fridge
	- Sources: BUY $
- **Cream**
	- Storage: fridge
	- Sources: BUY $$
- **Chocolate bar**
	- Storage: box
	- Sources: BUY $$
- **Cocoa powder**
	- Storage: bag
	- Sources: BUY $$$
- **Chocolate chips**
	- Storage: countertop
	- Sources:
		- Recipe: chocolate bar @ cutting board
		- BUY $$$
- **Salted caramels**
	- Storage: countertop
	- Sources:
		- BUY $$$
- **Frosting**
	- Storage: fridge
	- Sources:
		- Recipe: sugar @ mixer
		- BUY $$
	- Modifiers:
		- X flavoring = X frosting (or BUY $$$$)
- **Chocolate frosting**
	- Storage: fridge
	- Sources:
		- Recipe: frosting + cocoa powder @ mixer
		- BUY $$$
	- Modifiers:
		- X flavoring = chocolate-X frosting (or BUY $$$$$)
- **Whipped Cream**
	- Storage: fridge
	- Sources:
		- Recipe: cream @ mixer (medium)
		- Buy $$$
	- Doubles the quantity when making by hand
- **Pastry Cream**
	- Storage: fridge
	- Sources:
		- Recipe: cream + egg + sugar @ mixer; cook with: saucepan (quick)
		- BUY $$$
- **Strawberry Jelly**
	- Storage: fridge
	- Sources
		- Recipe: (LATER)
		- BUY $$$
- **Chocolate Pudding**
	- Storage: fridge
	- Sources
		- Recipe: cocoa powder + cream + sugar @ mixer; cook with: saucepan (quick)
		- BUY $$$

### Ingredients: never seem to run out

- **Muffin Liners**
	- Storage: countertop
	- Sources: BUY $
	- Variants:
		- White
		- Pastel blue
		- Stretch goals:
			- Dark blue
			- Pastel yellow
			- Yellow
			- Pastel red
			- Red
			- Yellow stars on purple
			- Yellow and pale green swirls
			- ...Whatever other colors and designs you want
	- Notes:
		- If approached empty handed, you can set the color dispensed by the box
		- One color per box; if you want multiple colors at once, buy another box
- **Sprinkles**
	- Storage: countertop
	- Sources: BUY $$
	- Variants:
		- Rainbow
		- Chocolate
		- White
		- Ball bearing
- **Hard sugar candy shapes**
	- Storage: countertop
	- Sources: BUY $$$
	- Variants:
		- Candy bats
		- Candy eyeballs
		- Candy ghosts
- **Flavoring** (also induces color)
	- Storage: countertop
	- Sources: BUY $$$$
	- Variants:
		- Ube (purple)
		- Cherry (dark purple-red)
		- Strawberry (pink)
		- Raspberry (red)
		- Orange (orange)
		- Caramel (brown-orange)
		- Almond (buff)
		- Lemon (yellow)
		- Lime (yellow-green)
		- Mint (pale blue-green)
		- Blueberry (blue-purple)
- **Candied flowers**
	- Storage: countertop
	- Sources: BUY $$$$$
	- Variants:
		- White
		- Yellow
		- Red
		- Blue

### Appliances

- **Oven**
	- Upgrade: auto turn off (no burning)
	- Replaced or supplanted with **Convection oven**
- **Mixer**
	- Upgrade: dough hook (unlocks mechanical bread kneading)
	- Replaced or supplanted with **Jumbo mixer**
- **Cutting board**
	- Upgrade: sharper knives (faster)
	- Replaced or supplanted with **Food processor**
- **Stovetop (saucepan)**
	- Upgrade: auto turn off (no burning)
	- Replaced or supplanted with **Induction stovetop (double boiler)**

### Tools

Just lying on the countertop

Also there is an arbitrary amount of countertop space

- **Piping bag**
	- Unlock: $
	- Fill with things like cream or custard
	- Use to inject "post-bake" filling
- **Cake knife**
	- Unlock: cake + $
	- Used to slice cake

### Products

#### Cookies

- **Cookie**
	- Unlock: available from start
	- Recipe: sugar + flour @ mixer
	- Modifiers:
		- none = sugar cookie
		- + cocoa powder = chocolate cookie
		- + chocolate chips = chocolate chip cookie
		- + salted caramels = salted caramel cookie
		- + X flavoring = X cookie
	- Cook: dough @ oven (quick)
	- Post-bake fillings:
		- NONE
	- Decoration:
		- Frosting
	- Doodads:
		- Sprinkles
		- Hard candy shapes
		- Candied flowers
	- Makes: 12
	- Display: room temp
- **Jumbo Cookie**
	- Unlock: $$
	- Makes: 3
	- ...Otherwise same as regular cookie

#### Cupcakes

- **Cupcake**
	- Unlock: $
	- Recipe: sugar + flour @ mixer
	- Modifiers:
		- none = cupcake
		- + cocoa powder = chocolate cupcake
		- + chocolate chips = chocolate chip cupcake
		- + salted caramels = salted caramel cupcake
		- + X flavoring = X cupcake
	- Cook: dough + muffin liners @ oven (medium)
	- Post-bake fillings:
		- Pastry cream
		- Whipped cream
		- Strawberry jelly
		- Chocolate pudding
	- Decoration:
		- Frosting
		- Whipped cream
	- Doodads:
		- Sprinkles
		- Hard candy shapes
		- Candied flowers
		- Chocolate chips
	- Makes: 6
	- Display: room temp
- **Jumbo Cupcake**
	- Unlock: $$$
	- Makes: 2
	- ...Otherwise same as regular cupcake

#### Cakes

- **Cake**
	- Unlock: $$
	- Recipe: sugar + flour + egg
	- Cook: oven (long)
	- Modifiers:
		- none = cake
		- + cocoa powder = chocolate cake
		- + salted caramels = salted caramel cake
	- Post-bake fillings:
		- (Becomes the strata in between the cake layers)
		- Whipped cream
		- Strawberry jelly
		- Ice cream (display -> frozen)
	- Decoration:
		- Frosting
		- Whipped cream
	- Doodads:
		- Sprinkles
		- Candied flowers
	- Makes: 1
	- Display: cold
- **Cake Slice**
	- Unlock: cake
	- Recipe: cake @ cake knife
	- Makes: 6
	- Display: cold

## Ideas for later

- Candy cane chunks
- Fruit
	- Banana
	- Pumpkin
	- Apple
	- Strawberry
	- Raisins
	- Craisins
	- Pecan
	- Macadamia nuts
- Peanut butter cups
- Fryer for donuts
- PUMPKIN PIE!!!!
- Ice cream
- Candy (Wanko really wants)
- Sweet breads
- Marshmallows

