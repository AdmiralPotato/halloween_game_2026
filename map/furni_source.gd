@tool
class_name FurniSource
extends FurniNode

const ITEM_SCENE := preload("res://map/ItemNode.tscn")

@export var ingredient_type: ItemNode.IngredientType:
	set(value):
		$StaticBody3D/CandySprite.play("%d" % value)
		ingredient_type = value

func _ready():
	ingredient_type = ingredient_type

func provide_item() -> ItemNode:
	var item: ItemNode = ITEM_SCENE.instantiate()
	add_child(item)
	item.global_position = $StaticBody3D/CandySprite.global_position
	item.ingredient_type = ingredient_type
	return item
