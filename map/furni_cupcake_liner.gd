@tool
class_name FurniCupcakeLiner
extends FurniStation

func interact(player: Player):
	Global.cupcake_ui.open()
	Global.cupcake_ui.connect("select_liner", _on_select_liner)
	Global.cupcake_ui.connect("cancel", _on_cancel)


func unsubscribe() -> void:
	Global.cupcake_ui.disconnect("select_liner", _on_select_liner)
	Global.cupcake_ui.disconnect("cancel", _on_cancel)


func _on_select_liner(liner_modifier: ItemInfo) -> void:
	print("OMG A LINER!!", liner_modifier)
	var held = Global.player.held_object
	if held:
		var stack = ItemStack.new(liner_modifier)
		held.stack.modifiers.append(stack)
		held.stack.emit_changed()
	else:
		print('But the player has no held item so it cannot be added to anything')
		#var new_item = ItemNode.make_node(liner_modifier)
		#Global.player.held_object = new_item
		#Global.player.held_object.stack.emit_changed()
	unsubscribe()


func _on_cancel() -> void:
	print("Liner UI canceled")
	unsubscribe()
