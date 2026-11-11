extends RigidBody3D

const CAMERA_MIN = Vector3(0, 2.5, 0.5)
const CAMERA_MAX = Vector3(0, 9, 4.5)

const SMOL_ITEM = Vector3.ONE
const SMOL_FURNI = Vector3.ONE * 0.6
const PICK_RANGE = 0.75

signal held_object_changed

## How much force the birb can apply on a given axis
@export var movement_force := 30
## How fast the birb wants to go when a given axis is maxed out
@export var movement_speed := 8
## How fast the camera can move in and out
@export var camera_speed := 0.025
@export var camera_zoom := 0.5
## How fast the birb wants to turn in RADIANS per second
@export var turn_speed := TAU

@export var input_enabled := true

var in_rearrange_mode := false
var indicator_color: Color:
	get:
		return Color("ddcc31") if in_rearrange_mode else Color("1fff52")
var cursor_last_item: ItemNode = null

@onready var carry_node := $Hand/Carry
@onready var hand_node := $Hand
@onready var skeleton := $mage/mage_bones/Skeleton3D
@onready var hand_bone: int = skeleton.find_bone("handItem_R")
@onready var mesh_node := $mage
@onready var indicator: SpotLight3D = $InteractIndicator
@onready var cursor: PlayerCursor = $PlayerCursor
@onready var camera: Camera3D = $Dolly/Camera3D
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
				v.reparent(carry_node)
			else:
				carry_node.add_child(v)
		held_object_changed.emit()


func get_save_state() -> Dictionary:
	var save := {
		pos = [global_position.x, global_position.z],
		rot = rotation.y
	}
	if held_object:
		save.hand = held_object.get_save_state()
	return save


func set_save_state(save: Dictionary):
	global_position.x = save.pos[0]
	global_position.z = save.pos[1]
	basis = Basis().rotated(Vector3.UP, save.rot)
	if 'hand' in save:
		held_object = BaseMapNode.from_save_state(save.hand)
	else:
		held_object = null


func _ready():
	Global.request_debug_info.connect(register_debug_info)


func register_debug_info(_dp: DebugPanel):
	DebugPanel.monitor("Held Object", self, "held_object", 1)


func _physics_process(delta):
	if Input.is_action_just_pressed("toggle_rearrange"):
		in_rearrange_mode = !in_rearrange_mode
		indicator.light_color = indicator_color

	if Input.is_action_just_pressed("camera_reset"):
		camera_zoom = 0.5

	var pointing: Vector2i = \
			Global.tilemap.find_tile(position, basis.z, PICK_RANGE)
	var world_pointing = Global.tilemap.to_world_point(pointing)
	indicator.global_position = Vector3(
			world_pointing.x,
			indicator.global_position.y,
			world_pointing.z,
	)
	var pointed_furni: FurniNode = Global.tilemap.get_furni(pointing)
	var cursor_shown := false
	if pointed_furni:
		var inode: ItemNode = pointed_furni.query_item()
		if inode and inode.stack:
			cursor_shown = true
			cursor.text = str(inode.stack)
			if inode != cursor_last_item or not cursor.visible:
				if inode.is_animating:
					# capture a closure so we can evaluate inode.global_position
					# at a later time
					inode.finished_animating.connect(
							func(): cursor.popup_at(inode.global_position),
							CONNECT_ONE_SHOT
					)
				else:
					cursor.popup_at(inode.global_position)
			cursor_last_item = inode
	if not cursor_shown:
		cursor.visible = false
		cursor_last_item = null
	
	hand_node.position = skeleton.get_bone_global_pose(hand_bone).origin

	var input_vec := (
		Vector2(
			Input.get_axis("move_left", "move_right"),
			Input.get_axis("move_up", "move_down"),
		)
		if input_enabled else
		Vector2.ZERO
	)
	var desired_x_motion := input_vec.x * movement_speed
	var desired_z_motion := input_vec.y * movement_speed
	self.constant_force = Vector3(
		clamp(desired_x_motion - self.linear_velocity.x, -1.0, 1.0),
		0.0,
		clamp(desired_z_motion - self.linear_velocity.z, -1.0, 1.0),
	) * movement_force
	var camera_input := Input.get_axis("camera_in", "camera_out")
	camera_zoom = clamp(camera_zoom + (camera_input * camera_speed), 0, 1)
	camera.position = lerp(CAMERA_MIN, CAMERA_MAX, camera_zoom)
	$AnimationTree.set(&"parameters/Carry/blend_position", input_vec.length())
	$AnimationTree.set(&"parameters/NoCarry/blend_position", input_vec.length())
	if Vector2(desired_x_motion, desired_z_motion).length() > 0.1:
		var desired_facing = atan2(desired_x_motion, desired_z_motion)
		var facing_delta = angle_difference(rotation.y, desired_facing)
		rotation.y += facing_delta * turn_speed * delta
	if Input.is_action_just_pressed("pickup"):
		var tilemap := Global.tilemap
		var old_held := held_object
		if held_object is FurniNode or (not held_object and in_rearrange_mode):
			# doesn't matter if we're in rearrange mode if we're already holding furni
			held_object = Global.tilemap.swap_furni(pointing, held_object,
					Global.tilemap.to_world_point(pointing).direction_to(global_position),
			)
		elif held_object is ItemNode or (not held_object and not in_rearrange_mode):
			held_object = Global.tilemap.swap_item(pointing, held_object)
		# If we're holding an object now, and it's a new one we picked up...
		if held_object and held_object != old_held:
			held_object.transform = Transform3D(
				Basis().scaled(SMOL_ITEM if held_object is ItemNode else SMOL_FURNI),
				Vector3.ZERO,
			)
			held_object.animate_to_current_transform()
		if old_held and held_object != old_held:
			old_held.animate_to_current_transform()
	if Input.is_action_just_pressed("interact"):
		Global.tilemap.interact(pointing, self)
