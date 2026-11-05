extends CenterContainer

@export var main_menu: PackedScene

# There's no signal for this, I guess, which makes me a little sad.
func _process(delta: float) -> void:
	visible = get_tree().paused

func _on_resume_pressed() -> void:
	get_tree().paused = false

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("menu"):
		get_tree().paused = not get_tree().paused
		get_viewport().set_input_as_handled()


func _on_export_pressed():
	if OS.has_feature("web"):
		JavaScriptBridge.download_buffer(
				JSON.stringify(Global.get_save_state()).to_utf8_buffer(),
				"save.json"
		)
	else:
		%SaveDialog.popup_centered_clamped()


func _on_save_dialog_file_selected(path):
	print('save state to: ', path)
	var fd := FileAccess.open(path, FileAccess.WRITE)
	fd.store_string(JSON.stringify(Global.get_save_state()))
	fd.flush()


func _on_exit_to_menu_pressed():
	get_tree().paused = false
	get_tree().change_scene_to_packed(main_menu)
