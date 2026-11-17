@tool
extends MapBase


func _ready() -> void:
	super()
	%Dialogue.start(
		DialogueScene.from_path("res://business/dialogs/intro.json")
	)
