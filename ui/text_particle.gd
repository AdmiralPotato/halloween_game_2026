class_name TextParticle
extends Label3D

@export var time: float = 1.0

func _ready():
	print(self, ' spawned at ', global_position)
	var to_mod := Color(modulate)
	var to_outline_mod := Color(outline_modulate)
	to_mod.a = 0
	to_outline_mod.a = 0
	
	var tween := create_tween().set_ease(Tween.EASE_OUT)
	tween.tween_property(self, ^"modulate", to_mod, time)
	tween.parallel().tween_property(self, ^"outline_modulate", to_outline_mod, time)
	tween.parallel().tween_property(self, ^"global_position", global_position + Vector3.UP, time)
	tween.tween_callback(queue_free)
