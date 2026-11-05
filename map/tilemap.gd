@tool
extends Node3D
class_name Tilemap
## Manages a 2D collection of tiles, which can be occupied and interacted with.

class Tile extends RefCounted:
	var furni: FurniNode
	func get_save_state() -> Dictionary:
		if not furni:
			return {}
		return {furni = furni.get_save_state()}
	func set_save_state(save: Dictionary):
		if 'furni' in save:
			furni = FurniNode.from_save_state(save.furni)
		else:
			furni = null

var tiles: Dictionary[Vector2i, Tile]
var pathfinder := AStarGrid2D.new()

func create_slots(minCoord: Vector2i, size: Vector2i, ...extra_args):
	var args = extra_args
	args.insert(0, null)
	pathfinder.region = Rect2i(minCoord, size)
	pathfinder.update()
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
				pathfinder.set_point_solid(xy)
			tiles.set(xy, tile)

## Forget everything we think we know about tiles.
func clear():
	tiles.clear()
	pathfinder.clear()


func get_save_state() -> Dictionary:
	var rect := pathfinder.region
	var save := {
		region = [rect.position.x, rect.position.y, rect.size.x, rect.size.y]
	}
	for pt in tiles:
		var tpt := "%d,%d" % [pt.x, pt.y]
		var tile := tiles[pt]
		save[tpt] = tile.get_save_state()
	return save

func set_save_state(save: Dictionary):
	clear()
	create_slots(
			Vector2i(save.region[0], save.region[1]),
			Vector2i(save.region[2], save.region[3])
	)
	for tpt in save:
		var parts := (tpt as String).split(",")
		if parts.size() != 2:
			continue
		var pt := Vector2i(int(parts[0]), int(parts[1]))
		tiles[pt].set_save_state(save[tpt])
		if tiles[pt].furni:
			pathfinder.set_point_solid(pt)
	


## Convert a tile position to a world position. This position is on the floor,
## in the center of the tile--where the tile itself would be placed.
func to_world_point(xy: Vector2i) -> Vector3:
	return Vector3(xy.x + 0.5, 0.0, xy.y + 0.5)


## Returns the coordinates of a tile that someone standing at `position` and
## facing `facing` (a unit vector) should be interacting with / picking up from
## / putting down on. (This tile may or may not actually exist.)
func find_tile(player_position: Vector3, facing: Vector3, reach: float = 1.0) -> Vector2i:
	var target_pos := player_position + facing * reach
	return Vector2i(floor(target_pos.x), floor(target_pos.z))


## Returns an array of coordinates of tiles that have the given type of FurniNode
## on them.
func get_tiles_of_type(script) -> Array[Vector2i]:
	var res: Array[Vector2i] = []
	for tile in tiles:
		if tiles[tile].furni and tiles[tile].furni.get_script() == script:
			res.append(tile)
	return res

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
func swap_furni(xy: Vector2i, new_node: FurniNode, facing := Vector3.BACK) -> FurniNode:
	var tile := _get_tile(xy)
	if !tile: return new_node
	var old_node := tile.furni
	if old_node and not old_node.can_take():
		return new_node
	if old_node:
		old_node.store_global_transform()
		old_node.name = "FurniPickedUp"
		remove_child(old_node)
		old_node.pack()
		pathfinder.set_point_solid(xy, false)
	tile.furni = new_node
	if new_node:
		new_node.store_global_transform()
		if new_node.get_parent():
			new_node.reparent(self, false)
		else:
			add_child(new_node)
		var axis := facing.abs().max_axis_index()
		var rot := Basis()
		match axis:
			Vector3.AXIS_X:
				if facing.x > 0:
					rot = rot.rotated(Vector3.UP, TAU / 4)
				else:
					rot = rot.rotated(Vector3.UP, -TAU / 4)
			Vector3.AXIS_Z:
				if facing.z <= 0:
					rot = rot.rotated(Vector3.UP, TAU / 2)
			Vector3.AXIS_Y:  # XXX should we even support this?
				if facing.y > 0:
					rot = rot.rotated(Vector3.RIGHT, -TAU / 4)
				else:
					rot = rot.rotated(Vector3.RIGHT, TAU / 4)
		new_node.transform = Transform3D(rot, Vector3(xy.x+0.5, 0.0, xy.y+0.5))
		new_node.name = "Furni%d_%d" % [xy.x, xy.y]
		new_node.unpack()
		pathfinder.set_point_solid(xy, true)
	return old_node


## Interact with the furni at the given position.
func interact(xy: Vector2i, player: Node):
	var tile := _get_tile(xy)
	if tile and tile.furni:
		tile.furni.interact(player)

## Ask the furni at the given position to pick up/drop an item. Returns the item
## the player should be left holding (which may be the one given).
##
## This method does *not* adjust the tree/hierarchy in any way. Individual furnis
## may, however; users should be prepared to cope with any in- or out-of-tree
## nodes returned.
func swap_item(xy: Vector2i, new_node: ItemNode) -> ItemNode:
	var tile := _get_tile(xy)
	if !tile: return new_node
	if not tile.furni: return new_node
	if new_node:
		new_node.store_global_transform()
		return tile.furni.accept_item(new_node)
	else:
		var item = tile.furni.provide_item()
		return item


func _init():
	pathfinder.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	if Engine.is_editor_hint():
		# It's tempting to just reference EditorInterface here, but this singleton
		# isn't available in exports (naturally). Somewhat surprisingly, even
		# referring to it in an export build causes a parse error (since the name
		# isn't defined), so pardon the workaround.
		Engine.get_singleton(&"EditorInterface")\
				.get_selection()\
				.connect("selection_changed", self.mess_with_children)
	else: # not Engine.is_editor_hint()
		Global.tilemap = self

func mess_with_children():
	for child in get_children():
		if child is FurniNode:
			var tile_x: int = floor(child.position.x)
			var tile_y: int = floor(child.position.z)
			child.name = "Furni%d_%d" % [tile_x, tile_y]
			child.position.x = tile_x + 0.5
			child.position.y = 0.0
			child.position.z = tile_y + 0.5

func pick_open_point() -> Vector2i:
	return pathfinder.get_point_data_in_region(pathfinder.region)\
			.filter(func(pt: Dictionary): return not pt.solid)\
			.pick_random()\
			.position

func get_customer_spawnpoint() -> Vector2i:
	return pathfinder.region.end - Vector2i.ONE
	
func get_customer_exitpoint() -> Vector2i:
	return Vector2i(0, pathfinder.region.end.y - 1)
