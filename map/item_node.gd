extends BaseMapNode
class_name ItemNode

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

@export var ingredient_type: ItemNode.IngredientType:
	set(value):
		$Sprite.play("%d" % value)
		ingredient_type = value

## If the given item can be combined with this item, do it, and return true.
## Otherwise, return false;
func attempt_combine(other_item: ItemNode) -> bool:
	return false
