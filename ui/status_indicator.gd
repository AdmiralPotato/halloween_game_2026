# StatusIndicator is already a node type in Godot, oops
# also, we need to be a tool because Station is a tool because Countertop is a tool
@tool
class_name HGStatusIndicator
extends Node3D


var is_running: bool:
	get:
		return $Sprite3D.visible


func start():
	$Sprite3D.visible = true
	%Progress.value = 0


func stop():
	$Sprite3D.visible = false


func set_progress(v: float):
	%Progress.value = v
