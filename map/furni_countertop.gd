extends FurniNode
class_name FurniCountertop
@export var item_height = 1;

func item_can_fit(other_item: ItemNode) -> bool:
	return true

func unpack():
	pass

func pack():
	pass
