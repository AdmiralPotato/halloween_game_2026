@tool

extends Control

const CANDY_COUNT := 9
const CANDY_SIZE := 256.0
const ROTATION_PERIOD := 2.8
const SCALING_PERIOD := 1.5

var rotween: Tween = null
var scatween: Tween = null

@export var candy_type: int = 0:
	set(x):
		x %= CANDY_COUNT
		if(candy_type != x):
			candy_type = x
			$Scaler/CandySprite.play("%d" % candy_type);

func _process(_delta):
	var rect = self.get_rect();
	var min_dimension = min(rect.size.x, rect.size.y)
	var scaled_value = min_dimension / CANDY_SIZE
	$Scaler.scale = Vector2(scaled_value, scaled_value)
	$Scaler.position = Vector2(rect.size.x * 0.5, rect.size.y * 0.5)

func _start_tweens() -> void:
	if !rotween:
		rotween = $Scaler/CandySprite.create_tween()
		rotween.set_loops()
		rotween.bind_node($Scaler/CandySprite)
		rotween.set_trans(Tween.TRANS_SINE)
		rotween.tween_property($Scaler/CandySprite, "rotation", PI/10, ROTATION_PERIOD * 0.5)
		rotween.tween_property($Scaler/CandySprite, "rotation", PI/-10, ROTATION_PERIOD * 0.5)
	if !scatween:
		scatween = $Scaler/CandySprite.create_tween()
		scatween.set_loops()
		scatween.bind_node($Scaler/CandySprite)
		scatween.set_trans(Tween.TRANS_SINE)
		scatween.tween_property($Scaler/CandySprite, "scale", Vector2(1.1, 1.1), SCALING_PERIOD * 0.5).set_ease(Tween.EASE_OUT)
		scatween.tween_property($Scaler/CandySprite, "scale", Vector2(0.9, 0.9), SCALING_PERIOD * 0.5).set_ease(Tween.EASE_IN)

func _stop_tweens() -> void:
	if rotween:
		rotween.kill()
		rotween = null
	if scatween:
		scatween.kill()
		scatween = null
	$Scaler/CandySprite.scale = Vector2(1, 1)
	$Scaler/CandySprite.rotation = 0
