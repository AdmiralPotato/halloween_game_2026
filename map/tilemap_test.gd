@tool
extends Node3D

var time: float = 0;

@export var number_of_tiles: Vector2i = Vector2i(8, 8):
	set(x):
		number_of_tiles = x
		update_floor()

func _ready():
	update_floor()
	if !Engine.is_editor_hint():
		$Tilemap.create_slots(Vector2i(0, 0), number_of_tiles)

func update_floor():
	$Floor.position.x = number_of_tiles.x * 0.5
	$Floor.position.y = -0.5
	$Floor.position.z = number_of_tiles.y * 0.5
	$Floor/CollisionShape3D.shape.size.x = number_of_tiles.x
	$Floor/CollisionShape3D.shape.size.z = number_of_tiles.y
	$Floor/MeshInstance3D.mesh.size.x = number_of_tiles.x
	$Floor/MeshInstance3D.mesh.size.z = number_of_tiles.y

func _physics_process(delta):
	if Engine.is_editor_hint():
		return
	var birb_position: Vector3 = $TestPlayer.position
	var birb_facing: Vector3 = $TestPlayer.basis.z
	var target_tile: Vector2i = $Tilemap.find_tile(birb_position, birb_facing, 1.4)
	$PlayerInteractIndicator.position.x = target_tile.x + 0.5
	$PlayerInteractIndicator.position.z = target_tile.y + 0.5

	time += delta
	Global.debug_panel.add_debug_property("Every 60 Frames", time, 60)
	Global.debug_panel.add_debug_property("Every 30 Frames", time, 30)
	Global.debug_panel.add_debug_property("Every 10 Frames", time, 10)
	Global.debug_panel.add_debug_property("Every Frame", time, 1)
