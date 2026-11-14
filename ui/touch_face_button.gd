@tool
extends TouchScreenButton

@export var icon: Texture2D

func _ready() -> void:
	$TextureRectIcon.texture = icon
