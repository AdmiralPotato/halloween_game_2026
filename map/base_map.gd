@tool
class_name BaseMap
extends Node3D

const FURNI_COUNTERTOP := preload("res://map/FurniCountertop.tscn")
const FURNI_CUTTINGBOARD := preload("res://map/FurniCuttingboard.tscn")
const FURNI_FRIDGE := preload("res://map/FurniFridge.tscn")
const FURNI_MIXER := preload("res://map/FurniMixer.tscn")
const FURNI_OVEN := preload("res://map/FurniOven.tscn")
const FURNI_SOURCE := preload("res://map/FurniSource.tscn")
const FURNI_STORAGE := preload("res://map/FurniStorage.tscn")

const FURNI_DISPLAYCASE := preload("res://map/FurniDisplaycase.tscn")
const FURNI_REGISTER := preload("res://map/FurniCashregister.tscn")

const FURNI_LIST := [
	FURNI_COUNTERTOP,
	FURNI_CUTTINGBOARD,
	FURNI_FRIDGE,
	FURNI_MIXER,
	FURNI_OVEN,
	FURNI_STORAGE,
]

const CUSTOMER = preload("res://map/TestCustomer.tscn")

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

func get_save_state() -> Dictionary:
	return {
		tilemap = $Tilemap.get_save_state(),
		player = $TestPlayer.get_save_state(),
	}

func set_save_state(save: Dictionary):
	$Tilemap.set_save_state(save.tilemap)
	$TestPlayer.set_save_state(save.player)

func _ready():
	update_floor()
	if Engine.is_editor_hint():
		return

	build_storefront()
	$SpawnCustomer.start(get_customer_spawn_time())


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("shop"):
		get_viewport().set_input_as_handled()
		if $Shop.visible:
			$Shop.visible = false
		elif not $TestPlayer.held_object:
			$Shop.visible = true

func build_storefront():
	for x in range(number_of_tiles.x):
		for y in range(number_of_tiles.y - 5, number_of_tiles.y):
			var pt = Vector2i(x, y)
			var tile = null
			match number_of_tiles.y - y:
				5:
					if number_of_tiles.x - x > 2:
						# "wall"
						tile = FURNI_LIST[x % FURNI_LIST.size()].instantiate()
				3:
					if x == 0:
						tile = FURNI_REGISTER.instantiate()
					else:
						tile = FURNI_DISPLAYCASE.instantiate()
			var old = $Tilemap.swap_furni(pt, tile)
			if old:
				var open = $Tilemap.pick_open_point()
				$Tilemap.swap_furni(open, old)


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
	$GridMap.clear()
	for y in number_of_tiles.y:
		var tile = 3 # customer tile
		if y < number_of_tiles.y - 3:
			tile = 2 # kitchen tile
		for x in number_of_tiles.x:
			$GridMap.set_cell_item(Vector3i(x,0,y),tile)
	# walls
	var wall_direction_south = $GridMap.get_orthogonal_index_from_basis(
		Basis.looking_at(Vector3(0,0,-1))
	)
	#var wall_direction_north = $GridMap.get_orthogonal_index_from_basis(
		#Basis.looking_at(Vector3(0,0,1))
	#)
	var wall_direction_east = $GridMap.get_orthogonal_index_from_basis(
		Basis.looking_at(Vector3(-1,0,0))
	)
	var wall_direction_west = $GridMap.get_orthogonal_index_from_basis(
		Basis.looking_at(Vector3(1,0,0))
	)
	# top wall
	for x in number_of_tiles.x:
		$GridMap.set_cell_item(Vector3i(x,0,-1), 4, wall_direction_south)
	# vertical walls
	var x = number_of_tiles.x
	for y in number_of_tiles.y:
		$GridMap.set_cell_item(Vector3i(-1,0,y), 4, wall_direction_east)
		$GridMap.set_cell_item(Vector3i(x,0,y), 4, wall_direction_west)
	# top corners
	$GridMap.set_cell_item(Vector3i(-1,0,-1), 6, wall_direction_south)
	$GridMap.set_cell_item(Vector3i(x,0,-1), 6, wall_direction_west)
	# customer doors
	var door_y = number_of_tiles.y - 2
	$GridMap.set_cell_item(Vector3i(-1,0,door_y), 8, wall_direction_east)
	$GridMap.set_cell_item(Vector3i(-1,0,door_y+1), 7, wall_direction_east)
	$GridMap.set_cell_item(Vector3i(x,0,door_y), 7, wall_direction_west)
	$GridMap.set_cell_item(Vector3i(x,0,door_y+1), 8, wall_direction_west)


func _on_spawn_customer_timeout() -> void:
	var cust: TestCustomer = CUSTOMER.instantiate()
	$Customers.add_child(cust)
	cust.global_position = $Tilemap.to_world_point(
			$Tilemap.get_customer_spawnpoint()
	)
	$SpawnCustomer.start(get_customer_spawn_time())


func _on_test_player_held_object_changed() -> void:
	if $TestPlayer.held_object and $Shop.visible:
		$Shop.visible = false


func _on_shop_purchase_furni(furni: FurniInfo) -> void:
	if Global.gold < furni.cost:
		$GoldOverlay.flash()
		return
	Global.gold -= furni.cost
	var node: FurniNode = furni.scene.instantiate()
	node.pack()
	node.transform = node.transform.scaled($TestPlayer.SMOL)
	$TestPlayer.held_object = node
	$Shop.visible = false


func _on_shop_purchase_item(item: ItemInfo) -> void:
	var full_cost := item.actual_cost * item.max_stack_size
	if Global.gold < full_cost:
		$GoldOverlay.flash()
		return
	Global.gold -= item.actual_cost
	var furni: FurniSource = FURNI_SOURCE.instantiate()
	furni.stack = ItemStack.new(item)
	furni.pack()
	furni.transform = furni.transform.scaled($TestPlayer.SMOL_FURNI)
	$TestPlayer.held_object = furni
	$Shop.visible = false
