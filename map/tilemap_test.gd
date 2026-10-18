@tool
extends Node3D

var time: float = 0
var last_tile: Vector2i = Vector2i(0,0)
var FurniCountertop = preload("res://map/FurniCountertop.tscn")

@export var number_of_tiles: Vector2i = Vector2i(8, 8):
	set(x):
		number_of_tiles = x
		if is_node_ready():
			update_floor()

func _input(event) -> void:
	if event.is_action_pressed("pickup"):
		var store: FurniNode = null
		if not $Tilemap.get_furni(last_tile):
			store = FurniCountertop.instantiate()
		store = $Tilemap.swap_furni(last_tile, store)
		if store:
			store.free()

func _ready():
	update_floor()
	for x in range(0, number_of_tiles.x):
		$Tilemap.swap_furni(Vector2i(x,0), FurniCountertop.instantiate())
		$Tilemap.swap_furni(Vector2i(x,number_of_tiles.y - 1), FurniCountertop.instantiate())
	if !Engine.is_editor_hint():
		DebugPanel.monitor("Every 60 frames", self, "time", 60)
		DebugPanel.monitor("Every 30 frames", self, "time", 30)
		DebugPanel.monitor("Every 10 frames", self, "time", 10)
		DebugPanel.monitor("Every frame", self, "time", 1)
		DebugPanel.monitor("Every frame formatted: %.2f", self, "time", 1)

func update_floor():
	$Tilemap.clear();
	$Tilemap.create_slots(Vector2i(0, 0), number_of_tiles)
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
	last_tile = $Tilemap.find_tile(birb_position, birb_facing, 1.4)
	$PlayerInteractIndicator.position.x = last_tile.x + 0.5
	$PlayerInteractIndicator.position.z = last_tile.y + 0.5
	time += delta
