@tool
extends Node3D

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
