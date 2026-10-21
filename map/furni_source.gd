@tool
class_name FurniSource
extends FurniNode

const ITEM_SCENE := preload("res://map/ItemNode.tscn")

@export var stack: ItemStack:
	set(v):
		stack = v
		$StaticBody3D/ItemNode.stack = v

func provide_item() -> ItemNode:
	var item: ItemNode = ITEM_SCENE.instantiate()
	add_child(item)
	item.global_position = $StaticBody3D/ItemNode.global_position
	item.stack = stack
	return item
