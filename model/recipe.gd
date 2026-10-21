class_name Recipe
extends Resource

enum Location {
	CUTTING_BOARD,
	MIXER,
	SAUCEPAN,
	OVEN,
}

## A readable name for this recipe. Not significant to gameplay.
@export var name: String = ""
## What this recipe results in. item and size are used as-is; combined_attributes
## are merged, and modifiers are appended to.
@export var output: ItemStack
## The furniture in which this recipe is valid.
@export var location: Location = Location.CUTTING_BOARD
## The container required for this recipe, if non-empty. May name a kind of item
## (through the name field) or be a group name.
@export var container: String = ""
## Names (or groups) of kinds of items required for this recipe. Multiplicity is
## allowed; as many of each kind are required as matching entries in this list.
@export var ingredients: PackedStringArray = PackedStringArray()
## Names (or groups) of kinds of items optionally allowed for this recipe.
## Multiplicity is not recommended--one can always add as many of these kinds
## of items as desired.
@export var permitted_modifiers: PackedStringArray = PackedStringArray()

static func from_json(d: Dictionary, lookup_item: Callable) -> Recipe:
	var rec = Recipe.new()
	rec.name = d.get("human_name", "")
	rec.output = ItemStack.new(lookup_item.call(d.get("output")), d.get("quantity", 1))
	var pan = d.get("pan")
	if pan and pan != "NONE":
		rec.container = pan
	rec.location = Location[d.get("location", "CUTTING_BOARD")]
	for ingr in d.get("ingredients", []):
		rec.ingredients.append(ingr)
	for mod in d.get("allowedModifiers", []):
		rec.permitted_modifiers.append(mod)
	return rec
