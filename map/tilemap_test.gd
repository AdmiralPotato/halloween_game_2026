@tool
extends Node3D

const FURNI_COUNTERTOP := preload("res://map/FurniCountertop.tscn")
const FURNI_CUTTINGBOARD := preload("res://map/FurniCuttingboard.tscn")
const FURNI_FRIDGE := preload("res://map/FurniFridge.tscn")
const FURNI_MIXER := preload("res://map/FurniMixer.tscn")
const FURNI_OVEN := preload("res://map/FurniOven.tscn")
const FURNI_SOURCE := preload("res://map/FurniSource.tscn")
const FURNI_STORAGE := preload("res://map/FurniStorage.tscn")

const FURNI_DISPLAYCASE := preload("res://map/FurniDisplaycase.tscn")
const FURNI_WALL := FURNI_FRIDGE
const FURNI_REGISTER := preload("res://map/FurniCashregister.tscn")

const FURNI_LIST := [
	FURNI_COUNTERTOP,
	FURNI_CUTTINGBOARD,
	FURNI_FRIDGE,
	FURNI_MIXER,
	FURNI_OVEN,
	FURNI_STORAGE,
];

@export var number_of_tiles := Vector2i(8, 12):
	set(x):
		number_of_tiles = x
		if is_node_ready():
			update_floor()
			
@export var customer_spawn_time_range := Vector2(3.0, 15.0)

func get_customer_spawn_time() -> float:
	return randf_range(
			customer_spawn_time_range.x,
			customer_spawn_time_range.y,
	)

func _ready():
	update_floor()
	if Engine.is_editor_hint():
		return

	for x in range(0, number_of_tiles.x):
		var FurniPiece = FURNI_LIST[x % FURNI_LIST.size()]
		$Tilemap.swap_furni(Vector2i(x,0), FurniPiece.instantiate())
		
	build_storefront()
	$SpawnCustomer.start(get_customer_spawn_time())

func build_storefront():
	for x in range(number_of_tiles.x):
		for y in range(number_of_tiles.y - 4, number_of_tiles.y):
			var pt = Vector2i(x, y)
			var tile = null
			match number_of_tiles.y - y:
				4:
					if number_of_tiles.x - x > 2:
						tile = FURNI_WALL.instantiate()
				2:
					if x == 0:
						tile = FURNI_REGISTER.instantiate()
					else:
						tile = FURNI_DISPLAYCASE.instantiate()
			if tile:
				tile.locked = true
			$Tilemap.swap_furni(pt, tile)


func update_floor():
	$Tilemap.clear()
	$Tilemap.create_slots(Vector2i(0, 0), number_of_tiles)
	$Floor.position.x = number_of_tiles.x * 0.5
	$Floor.position.y = -0.5
	$Floor.position.z = number_of_tiles.y * 0.5
	var opposite = Vector3(number_of_tiles.x, 0, number_of_tiles.y)
	$Floor/WallNX.global_position = Vector3.ZERO
	$Floor/WallNZ.global_position = Vector3.ZERO
	$Floor/WallPX.global_position = opposite
	$Floor/WallPZ.global_position = opposite
	$Floor/FloorBox.shape.size.x = number_of_tiles.x
	$Floor/FloorBox.shape.size.z = number_of_tiles.y
	$Floor/MeshInstance3D.mesh.size.x = number_of_tiles.x
	$Floor/MeshInstance3D.mesh.size.z = number_of_tiles.y

func _physics_process(delta):
	if Engine.is_editor_hint():
		return
	var birb_position: Vector3 = $TestPlayer.position
	var birb_facing: Vector3 = $TestPlayer.basis.z
	var work_tile: Vector2i = $Tilemap.find_tile(birb_position, birb_facing, 1.4)
	$PlayerInteractIndicator.position.x = work_tile.x + 0.5
	$PlayerInteractIndicator.position.z = work_tile.y + 0.5
	if $TestPlayer.in_rearrange_mode:
		$PlayerInteractIndicator.light_color = Color("ddcc31")
	else:
		$PlayerInteractIndicator.light_color = Color("1fff52")


func _on_spawn_customer_timeout() -> void:
	print("would spawn a customer")
	$SpawnCustomer.start(get_customer_spawn_time())
