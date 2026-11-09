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

func get_save_state() -> Dictionary:
	var save := super()
	if stack:
		save.stack = stack.get_save_state()
	return save

func set_save_state(save: Dictionary) -> void:
	super(save)
	if 'stack' in save:
		stack = ItemStack.from_save_state(save.stack)
	else:
		stack = null
		
func update_node():
	if has_node(^"StaticBody3D/ItemNode"):
		$StaticBody3D/ItemNode.stack = stack

func provide_item() -> ItemNode:
	var item := ItemNode.make_node(stack)
	add_child(item)
	item.global_position = $StaticBody3D/ItemNode.global_position
	item.store_global_transform()
	$StaticBody3D/storageBox_v1/AnimationPlayer.play("furni_storage_box_activate")
	return item

func query_item() -> ItemNode:
	return $StaticBody3D/ItemNode
