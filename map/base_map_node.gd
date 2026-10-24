@abstract
class_name BaseMapNode
extends Node3D

const TWEEN_TIME = 0.2
var tween: Tween
var last_global_transform: Transform3D
signal finished_animating

func store_global_transform():
	last_global_transform = global_transform if is_inside_tree() else Transform3D()
	
func animate_to_current_transform():
	if tween:
		tween.kill()
	tween = create_tween().set_trans(Tween.TRANS_SINE)
	var new_transform = transform
	global_transform = last_global_transform  # updates .transform
	tween.tween_property(self, "transform", new_transform, TWEEN_TIME)
	tween.tween_callback(finished_animating.emit)
