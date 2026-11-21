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


func _on_select_liner(liner_modifier: ItemStack) -> void:
	print("OMG A LINER!!", liner_modifier)
	unsubscribe()


func _on_cancel() -> void:
	print("Liner UI canceled")
	unsubscribe()
