class_name FurniCountertop
extends FurniNode

func item_can_fit(_other_item: ItemNode) -> bool:
	# Any item can fit on a countertop
	return true
