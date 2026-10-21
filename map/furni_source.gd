@tool
class_name FurniSource
extends FurniNode

@export var stack: ItemStack:
	set(v):
		stack = v
		$StaticBody3D/ItemNode.stack = v

func provide_item() -> ItemNode:
	var item := ItemNode.make_node(stack)
	add_child(item)
	item.global_position = $StaticBody3D/ItemNode.global_position
	return item
