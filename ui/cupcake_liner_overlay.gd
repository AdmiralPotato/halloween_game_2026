class_name CupcakeLinerOverlay
extends Control

const ITEM_BUTTON = preload("res://ui/item_button.tscn")

signal select_liner(item: ItemInfo)
signal cancel()


func _ready() -> void:
	Global.cupcake_ui = self
	for info in Global.registry.get_items_by_sort():
		if info.cost_tier == 0:
			var button: ItemButton = ITEM_BUTTON.instantiate()
			button.item = info
			button.pressed.connect(select.bind(info))
			%Items.add_child(button)


func open() -> void:
	visible = true
	Global.player.input_enabled = false
	var first_liner = %Items.get_child(0)
	first_liner.grab_focus()


func select(info: ItemInfo) -> void:
	close()
	select_liner.emit(info)


func close() -> void:
	visible = false
	Global.player.input_enabled = true


func _unhandled_input(event: InputEvent) -> void:
	if visible == false:
		return
	if event.is_action_pressed("ui_cancel"):
		get_viewport().set_input_as_handled()
		cancel.emit()
		close()
