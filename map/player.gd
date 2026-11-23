class_name Player
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
## How fast the birb wants to turn in RADIANS per second
@export var turn_speed := TAU

@export var input_enabled := true

var in_rearrange_mode := false
var indicator_color: Color:
	get:
		return Color("ffeb38ff") if in_rearrange_mode else Color("1fff52")
var cursor_last_item: ItemNode = null

var pointing := Vector2i(0,0)

@onready var carry_node := $Hand/Carry
@onready var hand_node := $Hand
@onready var skeleton := $mage/mage_bones/Skeleton3D
@onready var hand_bone: int = skeleton.find_bone("handItem_R")
@onready var mesh_node := $mage
@onready var indicator := $InteractIndicator
@onready var indicator_material: StandardMaterial3D = $InteractIndicator/target/target.material_overlay
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
var source_furni: FurniNode = null
var source_location: Dictionary = {}

func set_source_location_from_tile(xy: Vector2i):
	var pointed_furni: FurniNode = Global.tilemap.get_furni(xy)
	if pointed_furni:
		source_location = {
			tile = xy,
			facing = Global.tilemap.basis_to_facing(pointed_furni.basis),
		}
	else:
		source_location = {}


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
	Global.player = self
	Global.request_debug_info.connect(register_debug_info)


func register_debug_info(_dp: DebugPanel):
	DebugPanel.monitor("Held Object", self, "held_object", 1)


func _physics_process(delta):
	pointing = \
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
	if camera_input != 0:
		Global.camera_zoom = clamp(Global.camera_zoom + (camera_input * camera_speed), 0, 1)
	camera.position = lerp(CAMERA_MIN, CAMERA_MAX, Global.camera_zoom)
	$AnimationTree.set(&"parameters/Carry/blend_position", input_vec.length())
	$AnimationTree.set(&"parameters/NoCarry/blend_position", input_vec.length())
	if Vector2(desired_x_motion, desired_z_motion).length() > 0.1:
		var desired_facing = atan2(desired_x_motion, desired_z_motion)
		var facing_delta = angle_difference(rotation.y, desired_facing)
		rotation.y += facing_delta * turn_speed * delta
	indicator.rotation.y = -rotation.y


func _unhandled_input(event: InputEvent) -> void:
	if !input_enabled:
		return
	if event.is_action_pressed("toggle_rearrange"):
		in_rearrange_mode = !in_rearrange_mode
		indicator_material.emission = indicator_color
		get_viewport().set_input_as_handled()

	if event.is_action_pressed("camera_reset"):
		Global.camera_zoom = 0.5
		get_viewport().set_input_as_handled()

	if event.is_action_pressed("pickup"):
		var tilemap := Global.tilemap
		var old_held := held_object
		if held_object is FurniNode or (not held_object and in_rearrange_mode):
			# doesn't matter if we're in rearrange mode if we're already holding furni
			set_source_location_from_tile(pointing)
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
			if held_object is ItemNode:
				source_furni = Global.tilemap.get_furni(pointing)
		if old_held and held_object != old_held:
			old_held.animate_to_current_transform()
		get_viewport().set_input_as_handled()
	
	if event.is_action_pressed("ui_cancel"):
		if held_object:
			held_object.store_global_transform()
		var old_held := held_object
		if (
			held_object is ItemNode
			and is_instance_valid(source_furni)
		):
			held_object = source_furni.accept_item(held_object)
			source_furni = null
		elif (
			held_object is FurniNode
			and "tile" in source_location
		):
			# cache this because we want to update the property with values from
			# the node we're about to swap with, if any
			var old_src_loc := source_location
			set_source_location_from_tile(source_location.tile)
			held_object = Global.tilemap.swap_furni(
					old_src_loc.tile,
					held_object,
					old_src_loc.facing,
			)
		if held_object != old_held:
			if held_object:
				held_object.transform = Transform3D(
						Basis().scaled(SMOL_ITEM if held_object is ItemNode else SMOL_FURNI),
						Vector3.ZERO,
				)
				held_object.animate_to_current_transform()
			if old_held:
				old_held.animate_to_current_transform()
		get_viewport().set_input_as_handled()

	if event.is_action_pressed("interact"):
		if in_rearrange_mode:
			Global.tilemap.rotate_furni(pointing)
		else:
			Global.tilemap.interact(pointing, self)
		get_viewport().set_input_as_handled()
