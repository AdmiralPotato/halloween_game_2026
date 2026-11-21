class_name CupcakeLinerOverlay
extends Control

const ITEM_STACK_BUTTON = preload("res://ui/item_stack_button.tscn")

signal select_liner(item: ItemStack)
signal cancel()


func _ready() -> void:
	Global.cupcake_ui = self
	for style in ItemNode.recipe_render_data.cupcake_liner.liner.keys():
		var button: ItemStackButton = ITEM_STACK_BUTTON.instantiate()
		var recipe = ItemInfo.new()
		recipe.name = 'cupcake_liner'
		recipe.display_name = 'cupcake liner'
		var stack = ItemStack.new(recipe)
		var style_info = ItemInfo.new()
		style_info.name = style
		style_info.display_name = style + ' liner'
		var style_stack = ItemStack.new(style_info)
		stack.modifiers.append(style_stack)
		button.stack = stack
		button.pressed.connect(select.bind(style_stack))
		%Items.add_child(button)


func open() -> void:
	visible = true
	Global.player.input_enabled = false
	var first_liner = %Items.get_child(0)
	first_liner.grab_focus()


func select(stack: ItemStack) -> void:
	close()
	select_liner.emit(stack)


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
