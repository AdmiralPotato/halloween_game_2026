@tool
extends FurniNode


@export var stack: ItemStack = null:
	set(new):
		if stack and stack.changed.is_connected(update_node):
			stack.changed.disconnect(update_node)
		stack = new
		if stack:
			stack.changed.connect(update_node, CONNECT_DEFERRED)
		update_node()


func _ready():
	update_node()


func update_node():
	if has_node(^"ItemNode"):
		$ItemNode.stack = stack
		$ItemNode.visible = stack != null


func accept_item(item: ItemNode) -> ItemNode:
	if not stack:
		stack = item.stack  # this sets up $ItemNode to be in tree
		var initial_transform := ($ItemNode as ItemNode).transform
		$ItemNode.global_transform = item.global_transform
		@warning_ignore("shadowed_variable_base_class")
		var tween := $ItemNode.create_tween().set_trans(Tween.TRANS_SINE)
		tween.tween_property($ItemNode, ^"transform", initial_transform, BaseMapNode.TWEEN_TIME)
		return null
	
	if not stack.is_stackable(item.stack):
		return item
	# grab this into our part of the tree for a sec, because it will be removed from elsewhere
	item.reparent(self)
	item.transform = $ItemNode.transform
	# will be animated by .animate_to_current_transform() by test_player.gd
	var _finish := func _finish():
		stack.count += item.stack.count
		item.queue_free()
	item.finished_animating.connect(_finish, CONNECT_ONE_SHOT)
	return null


func provide_item() -> ItemNode:
	if stack and stack.count >= 1:
		var result := stack.split(1)
		stack = result[0]
		var node = ItemNode.make_node(result[1])
		add_child(node)  # need to be in tree to store transform
		node.global_position = $ItemNode.global_position
		node.store_global_transform()
		return node
	return null


func query_item() -> ItemNode:
	if $ItemNode.visible:
		return $ItemNode
	return null


func interact(player: Node):
	if stack and stack.count > 1 and not player.held_object:
		var result := stack.split(stack.item.max_stack_size)
		stack = result[0]
		var node = ItemNode.make_node(result[1])
		# node may be null if result[1] is null or an empty stack
		if node:
			player.held_object = node
			node.global_position = $ItemNode.global_position
			node.store_global_transform()
			node.transform = Transform3D()
			node.animate_to_current_transform()
