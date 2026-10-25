@tool
class_name FurniDisplayCase
extends FurniCountertop

func _ready() -> void:
	update_cost()

func set_item(it: ItemNode):
	super(it)
	update_cost()
	
func update_cost():
	if item and item.stack:
		%Cost.visible = true
		%Cost.text = "$" + str(item.stack.sell_price)
	else:
		%Cost.visible = false
