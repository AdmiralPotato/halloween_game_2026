@tool
class_name FurniCountertop
extends FurniNode

@export var initial_stack: ItemStack:
	set(stack):
		initial_stack = stack
		item = ItemNode.make_node(initial_stack)

var item: ItemNode:
	get:
		if $Item.get_child_count() > 0:
			return $Item.get_child(0)
		return null
	set(it):
		while $Item.get_child_count() > 0:
			$Item.remove_child($Item.get_child(0))
		if it:
			if it.is_inside_tree():
				it.reparent($Item, false)
			else:
				$Item.add_child(it)
			it.transform = Transform3D()
			

func _ready() -> void:
	if initial_stack:
		item = ItemNode.make_node(initial_stack)

func accept_item(item: ItemNode) -> ItemNode:
	if item == self.item:
		push_error("Woah! Accepted item aliased with current item, bailing out!")
		return item
	if item.stack and self.item and self.item.stack:
		# Try stacking first
		var res := self.item.stack.accept(item.stack)
		item.stack = res.rest
		if res.success:
			# Some items were accepted; end the interaction now rather than swapping
			return item if item.stack else null
	
	var old_item := self.item
	self.item = item
	return old_item
	
func provide_item() -> ItemNode:
	var ret := item
	ret.store_global_transform()
	item = null
	return ret

func interact(player: Node):
	if (
			player.held_object == null \
			and item \
			and item.stack \
			and item.stack.item.is_category(ItemInfo.Category.CONTAINER) \
			and not item.stack.contents.is_empty()
	):
		player.held_object = ItemNode.make_node(
			item.stack.contents[-1]
		)
		item.stack.contents.remove_at(-1)
		item.stack.emit_changed()
