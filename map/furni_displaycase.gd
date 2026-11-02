@tool
class_name FurniDisplayCase
extends FurniCountertop

func _ready() -> void:
	update_cost()

var last_it: ItemNode = null
func set_item(it: ItemNode):
	if last_it and last_it.stack.changed.is_connected(update_cost):
		last_it.stack.changed.disconnect(update_cost)
	super(it)
	if it and it.stack:
		it.stack.changed.connect(update_cost, CONNECT_DEFERRED)
		last_it = it
	update_cost()
	
func update_cost():
	if item and item.stack:
		%Cost.visible = true
		%Cost.text = "$" + str(item.stack.sell_price)
	else:
		%Cost.visible = false
