class_name PlayerCursor
extends Node3D

## Additional Y offset for the cursor, to get it off the top of items
@export var additional_offset_y: float = 128.0


var text: String:
	get:
		return %Label.text
	set(new):
		%Label.text = new


@onready var sprite: Sprite3D = $Sprite3D
var tween: Tween
func popup_at(pos: Vector3) -> void:
	global_position = pos
	visible = true
	if tween:
		tween.kill()
	tween = create_tween()
	sprite.offset = Vector2(0, 112 + additional_offset_y)
	tween.tween_property(sprite, ^"offset", Vector2(0, 128 + additional_offset_y), 0.25)
	sprite.modulate = Color(1, 1, 1, 0)
	tween.parallel().tween_property(sprite, ^"modulate", Color(1, 1, 1, 1), 0.25)
