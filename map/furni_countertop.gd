class_name FurniCountertop
extends FurniNode

var item: ItemNode:
	get:
		return $Item.get_child(0)
	set(it):
		while $Item.get_child_count() > 0:
			$Item.remove_child($Item.get_child(0))
		if it:
			if it.is_inside_tree():
				it.reparent($Item, false)
			else:
				$Item.add_child(it)
			it.transform = Transform3D()

func accept_item(item: ItemNode) -> ItemNode:
	var old_item := self.item
	self.item = item
	return old_item
	
	
func provide_item() -> ItemNode:
	return item
