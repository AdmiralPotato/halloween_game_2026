class_name ItemInfo
extends Resource

enum StorageType {
	BAG,
	FRIDGE,
	FREEZER,
	CRATE,
	JAR,
	PAN_STAND,
}

enum Category {
	BASE,
	MODIFIER,
	PRODUCT,
	FILLING,
	DECORATION,
	DOODAD,
	CONTAINER,
}

enum Attribute {
	# Colors
	PALE,
	RED,
	ORANGE,
	BROWN,
	YELLOW,
	GREEN,
	BLUE,
	PURPLE,
	VARIEGATED,
	# Textures
	MOIST,
	SOFT,
	CRUMBLY,
	POP,
	# Flavors
	NUTTY,
	SAVORY,
	CHOCOLATEY,
	FRUITY,
	MINTY,
	SALTY,
	SWEET,
	TART,
	FLORAL,
}

const TIER_COSTS: Dictionary[int, int] = {1: 10, 2: 25, 3: 50, 4: 100, 5: 500}

## Name of this kind of item. May be used in Recipes.
@export var name: String = ""
## Name used in print-outs and displays for player reference.
@export var display_name: String = ""
## Containers in which this kind of item can be stored.
@export var storage_type: StorageType = StorageType.BAG
## Categories of items; control logic in various ways. For example, only CONTAINER
## may have contents; only PRODUCT can be sold; etc.
@export var categories: Array[Category] = []
## Cost tier of item; see TIER_COSTS
@export_range(0, 5, 1) var cost_tier: int = 0
## Maximum amount of this item that can be manipulated as one "stack" (in hand or
## inside furniture).
@export_range(1, 50, 1, "or_greater") var max_stack_size: int = 1
## Attributes this kind of item *intrinsically* has. Ingredients and modifiers
## contribute these to the combined_attributes of their ItemStacks.
@export var attributes: Dictionary[Attribute, int] = {}
## Groups this kind of item belongs to. These can be used as aliases for multiple
## kinds of items in Recipes.
@export var groups: PackedStringArray = PackedStringArray()
## How this item appears in the game.
@export var texture: Texture2D

static func from_json(name: String, d: Dictionary, variants: Dictionary = {}) -> ItemInfo:
	var info = ItemInfo.new()
	info.name = name
	info.display_name = d.get("human_name", "")
	info.storage_type = StorageType[d.get("storage_type", "BAG")]
	info.categories.assign(d.get("categories", []).map(
			func(cat: String): return Category[cat]
	))
	var price = d.get("buy_price")
	info.cost_tier = price if price != null else 0
	info.max_stack_size = d.get("max_stack_size", 1)
	var attrs = d.get("attributes", {})
	if typeof(attrs) == TYPE_STRING and attrs == "from_recipe":
		# recipe outputs already receive merged attrs; no need to specify any
		# intrinsic ones here.
		attrs = {}
	for attr in attrs:
		info.attributes[Attribute[attr.to_upper()]] = attrs[attr]
	var variant = variants.get(info.name)
	if variant:
		info.groups.append(variant.parent)
	var texture = d.get("texture")
	if texture:
		pass # TODO
	else:
		info.texture = PlaceholderTexture2D.new()
		info.texture.size = Vector2(256, 256)
	return info

func is_category(cat: Category) -> bool:
	return cat in categories
