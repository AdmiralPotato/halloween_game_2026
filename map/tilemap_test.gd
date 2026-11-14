@tool
extends BaseMap


func _ready() -> void:
	super()
	%Dialogue.start(
		DialogueScene.from_json(
			JSON.parse_string(
				FileAccess.get_file_as_string("res://business/dialogs/intro.json")
			)
		)
	)
