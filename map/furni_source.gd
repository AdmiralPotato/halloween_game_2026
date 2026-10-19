@tool
class_name FurniSource
extends FurniNode

enum IngredientType {
	PEANUTBUTTER_CUP,
	DUMDUM,
	TAFFY,
	PUMPKIN,
	CANDY_CORN,
	CARAMEL_APPLE,
	STARBURST,
	GUMDROP,
	KISS,
}

@export var ingredient_type: IngredientType:
	set(value):
		$StaticBody3D/CandySprite.play("%d" % value)
		ingredient_type = value

func item_can_fit(_other_item: ItemNode) -> bool:
	# Any item can fit on a countertop
	return true

func _ready():
	ingredient_type = ingredient_type
