extends Node3D
class_name Tilemap
## Manages a 2D collection of tiles, which can be occupied and interacted with.

class Tile extends RefCounted:
	var floor: Node3D
	var furni: FurniNode
	var item: ItemNode
	func _init(floor_node: Node3D):
		self.floor_node = floor_node

var floor_spawner: Callable
var tiles: Dictionary[Vector2i, Tile]

## _floor_spawner: A Callable that will spawn a floor scene for given tile
## coordinates and return its top-level Node. The Tilemap will translate the
## resulting Node into place. The first parameter will be the Vector2i
## coordinates of the tile. If additional arguments are passed to create_slots,
## they will be passed after the first parameter.
func _init(floor_spawner: Callable):
	self.floor_spawner = floor_spawner

func create_slots(min: Vector2i, size: Vector2i, ...extra_args):
	var args = extra_args
	args.insert(0, null)
	for x in range(min.x, min.x+size.x):
		for y in range(min.y, min.y+size.y):
			var xy = Vector2i(x, y)
			if tiles.has(xy):
				print("Warning: tried to create tile %v that already existed" % xy)
				continue
			args[0] = xy
			var floor = floor_spawner.callv(args)
			assert(floor)
			tiles.set(xy, floor)
			floor.translate = Vector3(x+0.5, 0, y+0.5)
			add_child(floor)

## Returns the coordinates of a tile that someone standing at `position` and
## facing `facing` (a unit vector) should be interacting with / picking up from
## / putting down on. (This tile may or may not actually exist.)
func find_tile(position: Vector3, facing: Vector3, reach: float = 1.0) \
-> Vector2i:
	var target_pos := position + facing * reach
	return Vector2i(floor(target_pos.x), floor(target_pos.z))

func _get_tile(xy: Vector2i) -> Tile:
	return tiles.get(xy)

## Returns the floor node at the given tile coordinates, or null if there is
## no tile there.
func get_floor(xy: Vector2i) -> Node3D:
	var tile := _get_tile(xy)
	if tile: return tile.floor
	else: return null

## Returns the furni node at the given tile coordinates, or null if there is
## no tile there.
func get_furni(xy: Vector2i) -> Node3D:
	var tile := _get_tile(xy)
	if tile: return tile.furni
	else: return null

## Returns the item node at the given tile coordinates, or null if there is
## no tile there.
func get_item(xy: Vector2i) -> Node3D:
	var tile := _get_tile(xy)
	if tile: return tile.item
	else: return null

## If there is a tile at the given coordinates, this replaces that tile's floor
## node and returns the one that used to be there. If not, returns the node
## you passed in.
##
## Removes the old node from our list of children, and adds the new node to our
## list of children. We will translate the new node appropriately. YOU are
## responsible for setting the translation of the returned node / ensuring it is
## a child of whomever it needs to be.
##
## NOTE: Unlike swap_furni and swap_item, a floor node can never be null.
func swap_floor(xy: Vector2i, new_node: Node3D) -> Node3D:
	assert(new_node)
	var tile := _get_tile(xy)
	if !tile: return new_node
	var old_node := tile.floor
	tile.floor = new_node
	remove_child(old_node)
	add_child(new_node)
	new_node.translation = Vector3(xy.x+0.5, 0.0, xy.y+0.5)
	return old_node

## If there is a tile at the given coordinates, this swaps the new node into
## place as a furni. If there was an old furni node, returns that. Otherwise,
## returns null.
##
## Removes the old node from our list of children, and adds the new node to our
## list of children. We will translate the new node appropriately. YOU are
## responsible for setting the translation of the returned node / ensuring it is
## a child of whomever it needs to be.
##
## NOTE: If there is an item, it will need a new Y translation. If there is
## furni, and it has a "placed_item_height" property, that will be used to
## decide the new Y translation. Otherwise it will be 0.
func swap_furni(xy: Vector2i, new_node: FurniNode) -> FurniNode:
	var tile := _get_tile(xy)
	if !tile: return new_node
	var old_node := tile.furni
	tile.furni = new_node
	remove_child(old_node)
	add_child(tile.furni)
	new_node.translation = Vector3(xy.x+0.5, 0.0, xy.y+0.5)
	if tile.item:
		if tile.furni && tile.furni.has_property("item_height"):
			tile.item.translation.y = tile.furni.item_height
		else:
			tile.item.translation.y = 0.0
	return old_node

## If there is a tile at the given coordinates, this swaps the new node into
## place as an item. If there was an old item node, returns that. Otherwise,
## returns null.
##
## Removes the old node from our list of children, and adds the new node to our
## list of children. We will translate the new node appropriately. YOU are
## responsible for setting the translation of the returned node / ensuring it is
## a child of whomever it needs to be.
##
## NOTE: If we are placing an item, and there is furni, and that furni has a
## "placed_item_height" property, that will be used to decide the new Y
## translation. Otherwise it will be 0.
func swap_item(xy: Vector2i, new_node: ItemNode) -> ItemNode:
	var tile := _get_tile(xy)
	if !tile: return new_node
	var old_node := tile.item
	tile.item = new_node
	remove_child(old_node)
	add_child(tile.item)
	new_node.translation = Vector3(xy.x+0.5, 0.0, xy.y+0.5)
	if tile.item:
		if tile.furni && tile.furni.has_property("item_height"):
			new_node.translation.y = tile.furni.item_height
	return old_node

## If there is a tile at the given coordinates, this attempts to combine the
## given item with an item already on the tile. If there is no item, this ends
## up being the same as swap_item. If there is an item, and it accepts the swap,
## we return null, indicating that you are no longer holding an item. If there
## is an item but the swap is rejected, or if there is no tile, we return the
## item you passed in.
##
## If we return an item, its tree membership was not affected.
func combine_item(xy: Vector2i, new_node: ItemNode) -> ItemNode:
	var tile := _get_tile(xy)
	if !tile: return new_node
	if tile.item != null:
		if tile.item.attempt_combine(new_node):
			new_node.queue_free();
			return null
		return new_node
	assert(tile.item == null)
	tile.item = new_node
	add_child(tile.item)
	new_node.translation = Vector3(xy.x+0.5, 0.0, xy.y+0.5)
	if tile.item:
		if tile.furni && tile.furni.has_property("item_height"):
			new_node.translation.y = tile.furni.item_height
	return null
