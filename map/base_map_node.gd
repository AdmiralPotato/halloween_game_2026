@abstract
class_name BaseMapNode
extends Node3D

const TWEEN_TIME = 0.2
var tween: Tween
var last_global_transform: Transform3D
signal finished_animating

@export_file("*.tscn") var current_scene: String = "UNSET"

static func save_transform(xf: Transform3D) -> Array:
	return [
			xf.basis.x.x, xf.basis.x.y, xf.basis.x.z,
			xf.basis.y.x, xf.basis.y.y, xf.basis.y.z,
			xf.basis.z.x, xf.basis.z.y, xf.basis.z.z,
			xf.origin.x, xf.origin.y, xf.origin.z,
	]

static func load_transform(a: Array) -> Transform3D:
	return Transform3D(
			Basis(
					Vector3(a[0], a[1], a[2]),
					Vector3(a[3], a[4], a[5]),
					Vector3(a[6], a[7], a[8]),
			),
			Vector3(a[9], a[10], a[11]),
	)

func get_save_state() -> Dictionary:
	return {
		script = get_script().resource_path,
		scene = current_scene,
		name = name,
		transform = save_transform(transform)
	}
	
func set_save_state(save: Dictionary) -> void:
	name = save.name
	transform = load_transform(save.transform)
	
static func from_save_state(save: Dictionary) -> BaseMapNode:
	print('BaseMapNode loading scene: ', save.scene)
	var scene := load(save.scene)
	var node: Node3D = scene.instantiate()
	node.set_script(load(save.script))
	(node as BaseMapNode).current_scene = scene.resource_path
	(node as BaseMapNode).set_save_state(save)
	return (node as BaseMapNode)

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
