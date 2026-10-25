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
const PER_EACH_MOD_BASE: float = 1.1
const PER_UNIQUE_MOD_BASE: float = 1.25
const PER_CRAFT_BASE: float = 1.5

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
## Base sell price.
@export_range(1, 100, 1) var sell_price: int = 5
## Maximum amount of this item that can be manipulated as one "stack" (in hand or
## inside furniture).
@export_range(1, 50, 1, "or_greater") var max_stack_size: int = 1
## Attributes this kind of item *intrinsically* has. Ingredients and modifiers
## contribute these to the combined_attributes of their ItemStacks.
@export var attributes: Dictionary[Attribute, int] = {}
## Groups this kind of item belongs to. These can be used as aliases for multiple
## kinds of items in Recipes.
@export var groups: PackedStringArray = PackedStringArray()
## ...if you have a complex set of layers for how this item appears in the game.
@export var texture_layers: Array[ItemInfoTextureLayer]
## How this item appears in the game.
@export var texture: Texture2D

static func from_json(label: String, d: Dictionary, variants: Dictionary = {}) -> ItemInfo:
	var info = ItemInfo.new()
	info.name = label
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
	var texture_path = d.get("texture")
	if texture_path and typeof(texture_path) == TYPE_STRING:
		info.texture = process_texture_string(texture_path)
	else:
		info.texture = PlaceholderTexture2D.new()
		info.texture.size = Vector2(256, 256)
	var texture_layers_data = d.get("texture_layers")
	if texture_layers_data and texture_layers_data.size() > 0:
		print('Item has texture layers ', info.name)
		info.texture_layers.assign([])
		for layer_data in texture_layers_data:
			var layer = ItemInfoTextureLayer.new()
			print('	layer name: ', layer_data.name)
			layer.name = layer_data.name
			layer.texture = process_texture_string(layer_data.texture)
			print('	layer texture: ', layer.texture)
			info.texture_layers.append(layer)
		print('	all layers ', info.texture_layers)
	return info

func is_category(cat: Category) -> bool:
	return cat in categories

func matches_spec(spec: String) -> bool:
	return name == spec or spec in groups

static func process_texture_string(texture_path: String) -> Texture2D:
	var parts: PackedStringArray = texture_path.split("@", true, 2)
	var result_texture = ResourceLoader.load(parts[0], "Texture2D")
	if parts.size() > 1:
		var atlas := AtlasTexture.new()
		var size: Vector2 = result_texture.get_size()
		var coords := Array(parts[1].split(",", true, 2))
		var spans := coords.map(func(part: String): return part.split("/", true, 2))
		var cell := size / Vector2(float(spans[0][1]), float(spans[1][1]))
		var index := Vector2i(int(spans[0][0]), int(spans[1][0]))
		atlas.atlas = result_texture
		atlas.region = Rect2(Vector2(index) * cell, cell)
		result_texture = atlas
	return result_texture
