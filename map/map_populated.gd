@tool
extends MapBase


func _ready() -> void:
	super()
	if Engine.is_editor_hint():
		return
	%Dialogue.start(
		DialogueScene.from_path("res://business/dialogs/intro.json")
	)
	Global.state.progress = \
		ProgressionHandler.from_path("res://business/progression.json")
