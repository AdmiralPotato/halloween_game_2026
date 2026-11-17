extends PanelContainer

@export_dir var scenes: String

func _ready() -> void:
	for ent in ResourceLoader.list_directory(scenes):
		if not ent.ends_with("/"):
			%SceneFiles.add_item(ent)


func _process(_delta: float) -> void:
	%Progress.value = %Dialogue.display_progress
	%Progress.indeterminate = not %Dialogue.is_displaying


func get_full_path(index: int) -> String:
	return scenes + "/" + %SceneFiles.get_item_text(index)


func get_selected_path():
	var sel: PackedInt32Array = %SceneFiles.get_selected_items()
	if not sel:
		return null
	return get_full_path(sel[0])


func _on_run_pressed() -> void:
	var path = get_selected_path()
	if not path:
		return
	%Dialogue.start(
		DialogueScene.from_path(path)
	)


func _on_scene_files_item_selected(index: int) -> void:
	%Run.disabled = %SceneFiles.get_selected_items().is_empty()


func _on_scene_files_item_activated(index: int) -> void:
	%Dialogue.start(
		DialogueScene.from_path(get_full_path(index))
	)


func _on_stop_pressed() -> void:
	%Dialogue.stop()


func _on_dialogue_visibility_changed() -> void:
	%PrevIndex.disabled = not %Dialogue.visible
	%NextIndex.disabled = not %Dialogue.visible
	%Redisplay.disabled = not %Dialogue.visible
	if not %Dialogue.visible:
		%SceneIndex.text = "(no scene running)"


func _on_prev_index_pressed() -> void:
	%Dialogue.rewind()


func _on_next_index_pressed() -> void:
	%Dialogue.advance()


func _on_dialogue_displaying() -> void:
	%SceneIndex.text = "%d/%d" % [%Dialogue.current_index, len(%Dialogue.dialogue_scene.messages) - 1]
	%State.text = "displaying"


func _on_dialogue_displayed() -> void:
	%State.text = "displayed"


func _on_dialogue_stopped() -> void:
	%State.text = "stopped"


func _on_redisplay_pressed() -> void:
	%Dialogue.display_current()
