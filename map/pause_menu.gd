extends CenterContainer

@export var main_menu: PackedScene

var previous_focus_holder: Control
func pause () -> void:
	previous_focus_holder = get_viewport().gui_get_focus_owner()
	get_tree().paused = true
	visible = true
	%Resume.grab_focus()

func resume () -> void:
	get_tree().paused = false
	if previous_focus_holder:
		previous_focus_holder.grab_focus()


# There's no signal for this, I guess, which makes me a little sad.
func _process(_delta: float) -> void:
	visible = get_tree().paused

func _on_resume_pressed() -> void:
	resume()

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("menu"):
		get_viewport().set_input_as_handled()
		if not get_tree().paused:
			pause()
		else:
			resume()
		return
	if visible and event.is_action_pressed("ui_cancel"):
		get_viewport().set_input_as_handled()
		resume()

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
	resume()
	get_tree().change_scene_to_packed(main_menu)
