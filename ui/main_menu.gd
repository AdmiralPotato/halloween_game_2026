extends MarginContainer

@export var loading_scene: PackedScene


func _ready() -> void:
	%MapList.clear()
	for map in Global.registry.maps:
		%MapList.add_item(map)
	%MapList.select(0)
	%Create.grab_focus()
	if OS.has_feature("web"):
		%Leave.visible = false


func _on_map_list_item_selected(_index):
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


var _file_callback = JavaScriptBridge.create_callback(web_file_callback)
func _on_load_pressed():
	if OS.has_feature("web"):
		var window = JavaScriptBridge.get_interface("window")
		var input = window.document.createElement('input')
		input.type = 'file'
		input.accept = 'application/json'
		input.addEventListener('input', _file_callback)
		input.click()
	else:
		%OpenDialog.popup_centered_clamped()


var _json_callback = JavaScriptBridge.create_callback(web_json_string_callback)
func web_file_callback(args):
	var event = args[0]
	event.target.files[0].text().then(_json_callback)


func web_json_string_callback(args):
	#print('web_json_string_callback: ', args[0])
	Global.set_save_state(JSON.parse_string(args[0]))


func _on_open_dialog_file_selected(path):
	Global.set_save_state(
			JSON.parse_string(
					FileAccess.get_file_as_string(path)
			)
	)
