@tool
class_name FurniSource
extends FurniNode

@export var stack: ItemStack:
	set(v):
		if stack:
			stack.changed.disconnect(update_node)
		stack = v
		if stack:
			stack.changed.connect(update_node, CONNECT_DEFERRED)
		update_node()
		
func update_node():
	if has_node(^"StaticBody3D/ItemNode"):
		$StaticBody3D/ItemNode.stack = stack

func provide_item() -> ItemNode:
	var item := ItemNode.make_node(ItemStack.new(stack.item, stack.count))
	add_child(item)
	item.global_position = $StaticBody3D/ItemNode.global_position
	return item
