# StatusIndicator is already a node type in Godot, oops
# also, we need to be a tool because Station is a tool because Countertop is a tool
@tool
class_name HGStatusIndicator
extends Node3D


var is_running: bool:
	get:
		return $Sprite3D.visible


func start():
	%Progress.value = 0
	await get_tree().process_frame
	$Sprite3D.visible = true


func stop():
	%Progress.value = 0
	$Sprite3D.visible = false


func set_progress(v: float):
	%Progress.value = v
