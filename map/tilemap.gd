extends Node3D
class_name Tilemap
## Manages a 2D collection of tiles, which can be occupied and interacted with.

class Tile extends RefCounted:
	var furni: FurniNode
	var item: ItemNode

var tiles: Dictionary[Vector2i, Tile]

func create_slots(minCoord: Vector2i, size: Vector2i, ...extra_args):
	var args = extra_args
	args.insert(0, null)
	for x in range(minCoord.x, minCoord.x+size.x):
		for y in range(minCoord.y, minCoord.y+size.y):
			var xy := Vector2i(x, y)
			if tiles.has(xy):
				print("Warning: tried to create tile %v that already existed" % xy)
				continue
			args[0] = xy
			var tile := Tile.new()
			var node_name := "Furni%d_%d" % [x, y]
			if self.has_node(node_name):
				tile.furni = self.get_node(node_name)
			tiles.set(xy, tile)

## Forget everything we think we know about tiles.
func clear():
	tiles.clear()

## Returns the coordinates of a tile that someone standing at `position` and
## facing `facing` (a unit vector) should be interacting with / picking up from
## / putting down on. (This tile may or may not actually exist.)
func find_tile(position: Vector3, facing: Vector3, reach: float = 1.0) \
-> Vector2i:
	var target_pos := position + facing * reach
	return Vector2i(floor(target_pos.x), floor(target_pos.z))

func _get_tile(xy: Vector2i) -> Tile:
	return tiles.get(xy)

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

## If there is a tile at the given coordinates, this swaps the new node into
## place as a furni. If there was an old furni node, returns that. Otherwise,
## returns null.
##
## Removes the old node from our list of children, and adds the new node to our
## list of children. We will translate the new node appropriately. YOU are
## responsible for setting the translation of the returned node / ensuring it is
## a child of whomever it needs to be.
##
## If new_node is null(player with empty hands), will remove the old_node and
## return it, like player decided to pick up that furniture.
##
## NOTE: If there is an item, it will need a new Y translation. If there is
## furni, and it has a "placed_item_height" property, that will be used to
## decide the new Y translation. Otherwise it will be 0.
func swap_furni(xy: Vector2i, new_node: FurniNode) -> FurniNode:
	var tile := _get_tile(xy)
	if !tile: return new_node
	var old_node := tile.furni
	if old_node:
		old_node.name = "FurniPickedUp"
		remove_child(old_node)
		old_node.pack()
	tile.furni = new_node
	if new_node:
		if new_node.get_parent():
			new_node.reparent(self, false)
		else:
			add_child(new_node)
		new_node.position = Vector3(xy.x+0.5, 0.0, xy.y+0.5)
		new_node.name = "Furni%d_%d" % [xy.x, xy.y]
		new_node.unpack()
	if tile.item:
		if tile.furni && tile.furni.has_property("item_height"):
			tile.item.position.y = tile.furni.item_height
		else:
			tile.item.position.y = 0.0
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
	new_node.position = Vector3(xy.x+0.5, 0.0, xy.y+0.5)
	if tile.item:
		if tile.furni && tile.furni.has_property("item_height"):
			new_node.position.y = tile.furni.item_height
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
	new_node.position = Vector3(xy.x+0.5, 0.0, xy.y+0.5)
	if tile.item:
		if tile.furni && tile.furni.has_property("item_height"):
			new_node.position.y = tile.furni.item_height
	return null

func _init():
	Global.tilemap = self
