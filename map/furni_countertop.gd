@tool
class_name FurniCountertop
extends FurniNode

@export var initial_stack: ItemStack:
	set(stack):
		initial_stack = stack
		item = ItemNode.make_node(initial_stack)
		update_configuration_warnings()

var item: ItemNode:
	get = get_item,
	set = set_item

func _get_configuration_warnings() -> PackedStringArray:
	var warnings := PackedStringArray()
	if initial_stack and not initial_stack.item.resource_path.begins_with("res://model/data/"):
		warnings.append(
				"Stack {stack} has .item stored at {path}; this will break item equality comparisons. Run res://map/relink_data.gd in your editor with this map selected or fix this by loading the ItemInfo directly from the filesystem.".format(
						{stack = initial_stack, path = initial_stack.item.resource_path}
				))
	return warnings

func get_save_state() -> Dictionary:
	var save := super()
	if item:
		save.item = item.get_save_state()
	return save

func set_save_state(save: Dictionary) -> void:
	super(save)
	if 'item' in save:
		item = ItemNode.from_save_state(save.item)
	else:
		item = null

func get_item() -> ItemNode:
	# Ignore non-ItemNode children--sometimes other nodes are placed here as, e.g.
	# effects (see FurniTrash).
	if $Item.get_child_count() > 0 and $Item.get_child(0) is ItemNode:
		return $Item.get_child(0)
	return null

func set_item(it: ItemNode):
	while $Item.get_child_count() > 0:
		$Item.remove_child($Item.get_child(0))
	if it:
		if it.is_inside_tree():
			it.reparent($Item)
		else:
			$Item.add_child(it)
		it.transform = Transform3D()


func _ready() -> void:
	if initial_stack:
		item = ItemNode.make_node(initial_stack)

func accept_item(_item: ItemNode) -> ItemNode:
	if _item == self.item:
		push_error("Woah! Accepted _item aliased with current _item, bailing out!")
		return _item
	if _item.stack and self.item and self.item.stack:
		# Try stacking first
		var res := self.item.stack.accept(_item.stack)
		_item.stack = res.rest
		if res.success:
			# Some items were accepted; end the interaction now rather than swapping
			return _item if _item.stack else null

	var old_item := self.item
	if old_item:
		old_item.store_global_transform()
	self.item = _item
	return old_item

func provide_item() -> ItemNode:
	var ret := item
	if ret:
		ret.store_global_transform()
	item = null
	return ret

func query_item() -> ItemNode:
	return item

func interact(player: Node):
	if (
			player.held_object == null \
			and item \
			and item.stack \
			and item.stack.item.is_category(ItemInfo.Category.CONTAINER) \
			and not item.stack.contents.is_empty()
	):
		var node := ItemNode.make_node(
			item.stack.contents[-1]
		)
		player.held_object = node
		node.last_global_transform = item.global_transform
		node.animate_to_current_transform()
		item.stack.contents.remove_at(-1)
		item.stack.emit_changed()
	elif (
			(
				player.held_object == null \
				or (
					player.held_object is ItemNode \
					and player.held_object.stack \
					and item and item.stack \
					and player.held_object.stack.is_stackable(item.stack) \
					and player.held_object.stack.count < \
						player.held_object.stack.item.max_stack_size
				)
			)
			and item \
			and item.stack \
			and item.stack.count > 1
	):
		var stacks := item.stack.split(1)
		if player.held_object:
			# XXX we can't handle failure in this branch, but it's guarded by
			# is_stackable and a max_stack_size check, so this should be okay
			player.held_object.stack.count += 1
			player.held_object.stack.emit_changed()
		else:
			var node := ItemNode.make_node(
					stacks[1]
			)
			player.held_object = node
			node.last_global_transform = item.global_transform
			node.animate_to_current_transform()
		item.stack = stacks[0]
		item.stack.emit_changed()
	elif (
		player.held_object != null
		and item
		and item.stack.item.is_category(ItemInfo.Category.PRODUCT)
	):
		var attempt_to_apply = item.stack.accept(player.held_object.stack)
		if attempt_to_apply.success:
			var node: ItemNode = player.held_object
			node.reparent(self)  # which removes it from held_object
			node.store_global_transform()
			node.global_transform = item.global_transform
			node.animate_to_current_transform()
			node.finished_animating.connect(node.queue_free)
			
