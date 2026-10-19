extends RigidBody3D

const HAND_POS = Vector3(0.0, -0.5, 0.5)
const SMOL = Vector3.ONE * 0.5
const TWEEN_TIME = 0.1

## How much force the birb can apply on a given axis
@export var movement_force := 30
## How fast the birb wants to go when a given axis is maxed out
@export var movement_speed := 8
## How fast the birb wants to turn in RADIANS per second
@export var turn_speed := TAU

var held_object: Node3D
var in_rearrange_mode := true

func _physics_process(delta):
	var input_vec := Vector2(
		Input.get_axis("move_left", "move_right"),
		Input.get_axis("move_up", "move_down"),
	)
	var desired_x_motion := input_vec.x * movement_speed
	var desired_z_motion := input_vec.y * movement_speed
	self.constant_force = Vector3(
		clamp(desired_x_motion - self.linear_velocity.x, -1.0, 1.0),
		0.0,
		clamp(desired_z_motion - self.linear_velocity.z, -1.0, 1.0),
	) * movement_force
	$AnimationTree.set("parameters/BlendSpace1D/blend_position", input_vec.length())
	if Vector2(desired_x_motion, desired_z_motion).length() > 0.1:
		var desired_facing = atan2(desired_x_motion, desired_z_motion)
		var facing_delta = angle_difference(self.rotation.y, desired_facing)
		self.rotation.y += facing_delta * turn_speed * delta
	if Input.is_action_just_pressed("pickup"):
		var target_tile := Global.tilemap.find_tile(self.position, self.basis.z, 1.4)
		var tilemap := Global.tilemap
		var old_held := held_object
		var old_xform := old_held.global_transform if old_held else Transform3D()
		if held_object is FurniNode || in_rearrange_mode:
			# doesn't matter if we're in rearrange mode if we're already holding furni
			var placed_furni = Global.tilemap.get_furni(target_tile)
			if placed_furni:
				# XXX assume it unlikely that the position of a Furni node
				# is exactly 0
				old_xform = placed_furni.global_transform
			held_object = Global.tilemap.swap_furni(target_tile, held_object)
		elif held_object is ItemNode || !in_rearrange_mode:
			held_object = Global.tilemap.swap_item(target_tile, held_object)
		# If we're holding an object now, it's because we picked one up.
		if held_object:
			add_child(held_object)
			# after we're added as a child, our global_position is again valid
			# based on our new hierarchy; tween over to where we want to be in
			# local space.
			held_object.global_transform = old_xform
			var tween = create_tween().set_trans(Tween.TRANS_SINE)
			var target = Transform3D()
			target.basis = target.basis.scaled(SMOL)
			target.origin = HAND_POS
			tween.tween_property(held_object, "transform", target, TWEEN_TIME)
		else:  # we put something down
			if old_held is FurniNode:
				var new_xform = old_held.transform  # set by swap_furni
				# reset to unity scale
				new_xform.basis = new_xform.basis.scaled(Vector3.ONE / new_xform.basis.get_scale())
				old_held.global_transform = old_xform
				var tween = create_tween().set_trans(Tween.TRANS_SINE)
				tween.tween_property(old_held, "transform", new_xform, TWEEN_TIME)
