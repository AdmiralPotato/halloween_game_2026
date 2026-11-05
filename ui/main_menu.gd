extends MarginContainer

@export var loading_scene: PackedScene


func _ready() -> void:
	%MapList.clear()
	for name in Global.registry.maps:
		%MapList.add_item(name)
		


func _on_map_list_item_selected(index):
	%Create.disabled = %MapList.get_selected_items().is_empty()


func _on_create_pressed():
	var sel: PackedInt32Array = %MapList.get_selected_items()
	if sel.is_empty():
		return
	var idx := sel[0]
	var sel_name = %MapList.get_item_text(idx)
	if sel_name not in Global.registry.maps:
		return
	Global.scene_change_info = {path = Global.registry.maps[sel_name]}
	get_tree().change_scene_to_packed(loading_scene)


func _on_leave_pressed():
	get_tree().quit()


func _on_load_pressed():
	%OpenDialog.popup_centered_clamped()


func _on_open_dialog_file_selected(path):
	Global.set_save_state(
			JSON.parse_string(
					FileAccess.get_file_as_string(path)
			)
	)
