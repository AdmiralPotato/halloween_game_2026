extends RigidBody3D

const SMOL = Vector3.ONE * 0.5

## How much force the birb can apply on a given axis
@export var movement_force := 30
## How fast the birb wants to go when a given axis is maxed out
@export var movement_speed := 8
## How fast the birb wants to turn in RADIANS per second
@export var turn_speed := TAU

var in_rearrange_mode := false

@onready var carry_node = $RightHand/Carry
@onready var right_hand_node = $RightHand
@onready var mesh_node = $mage
@onready var skeleton = $mage/mage_bones/Skeleton3D
@onready var hand_bone = skeleton.find_bone("hand_R")
var held_object: BaseMapNode:
	get:
		if carry_node.get_child_count() > 0:
			return carry_node.get_child(0)
		return null
	set(v):
		while carry_node.get_child_count() > 0:
			carry_node.remove_child(carry_node.get_child(0))
		if v:
			if v.is_inside_tree():
				v.reparent(carry_node, false)
			else:
				carry_node.add_child(v)


func _ready():
	Global.request_debug_info.connect(register_debug_info)
	
	
func register_debug_info(dp: DebugPanel):
	dp.monitor("Held Object", self, "held_object", 1)


func _physics_process(delta):
	if Input.is_action_just_pressed("toggle_rearrange"):
		in_rearrange_mode = !in_rearrange_mode
	right_hand_node.transform = skeleton.get_bone_global_pose(hand_bone)
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
		var facing_delta = angle_difference(rotation.y, desired_facing)
		rotation.y += facing_delta * turn_speed * delta
	if Input.is_action_just_pressed("pickup"):
		var target_tile := Global.tilemap.find_tile(self.position, basis.z, 1.4)
		var tilemap := Global.tilemap
		var old_held := held_object
		if held_object is FurniNode or (not held_object and in_rearrange_mode):
			# doesn't matter if we're in rearrange mode if we're already holding furni
			held_object = Global.tilemap.swap_furni(target_tile, held_object)
		elif held_object is ItemNode or (not held_object and not in_rearrange_mode):
			held_object = Global.tilemap.swap_item(target_tile, held_object)
		# If we're holding an object now, and it's a new one we picked up...
		if held_object and held_object != old_held:
			held_object.transform = Transform3D(Basis().scaled(SMOL), Vector3.ZERO)
			held_object.animate_to_current_transform()
		if old_held and held_object != old_held:
			old_held.animate_to_current_transform()
	if Input.is_action_just_pressed("interact"):
		var target_tile := Global.tilemap.find_tile(self.position, basis.z, 1.4)
		Global.tilemap.interact(target_tile, self)
