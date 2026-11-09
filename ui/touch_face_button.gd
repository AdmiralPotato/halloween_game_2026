@tool
extends TouchScreenButton

@export var labelText: String

func _ready() -> void:
	$Label.text = labelText
