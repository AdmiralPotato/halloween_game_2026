@tool

extends Control

const CANDY_COUNT = 9
const CANDY_SIZE = 256.0

@export var candy_type: int = 0:
	set(x):
		x %= CANDY_COUNT
		if(candy_type != x):
			candy_type = x
			$CandySprite.play("%d" % candy_type);

func _process(_delta):
	var rect = self.get_rect();
	var min_dimension = min(rect.size.x, rect.size.y)
	var scaled_value = min_dimension / CANDY_SIZE
	$CandySprite.scale = Vector2(scaled_value, scaled_value)
	$CandySprite.position = Vector2(rect.size.x * 0.5, rect.size.y * 0.5)

func _on_mouse_entered() -> void:
	print("Yoooo i got moused over and my candy type in decimal was %d" % candy_type)
