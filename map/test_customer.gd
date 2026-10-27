class_name TestCustomer
extends RigidBody3D

# TODO: refactor this into a common base with TestPlayer
#region from player
## How much force the birb can apply on a given axis
@export var movement_force := 30
## How fast the birb wants to go when a given axis is maxed out
@export var movement_speed := 8
## How fast the birb wants to turn in RADIANS per second
@export var turn_speed := TAU
#endregion

@abstract class State extends RefCounted:
	var owner: TestCustomer

	func _init(_owner: TestCustomer):
		self.owner = _owner

	func _to_string():
		return "State"

	@abstract func tick(delta: float) -> State


class Vanish extends State:
	func _to_string():
		return "Vanish"

	func tick(_delta: float) -> State:
		owner.queue_free()
		return null


class Leave extends State:
	func _to_string():
		return "Leave"
		
	func tick(_delta: float) -> State:
		return WanderTo.new(owner, Global.tilemap.get_customer_exitpoint(),
				Vanish.new(owner),
		)


class Dwell extends State:
	var until: float

	func _init(_owner: TestCustomer, duration: float):
		super(_owner)
		until = _owner.time_in_scene + duration

	func _to_string():
		return "Dwell:{0}".format([until])

	func tick(_delta: float) -> State:
		if owner.time_in_scene >= until:
			return ChooseState.new(owner)
		return null


class WanderTo extends State:
	const NOWHERE = Vector2i(-1, -1)
	const RECOMPUTE_TIME = 5000  # ms
	const CLOSE = 0.3  # within _about_ 0.1m

	var to: Vector2i
	var path: PackedVector2Array
	var next_path_recompute := 0
	var next_state: State

	func _init(_owner: TestCustomer, _to: Vector2i = NOWHERE, next: State = null):
		super(_owner)
		if _to == NOWHERE:
			_to = Global.tilemap.pick_open_point()
		if not next:
			next = Dwell.new(_owner, randf_range(2.0, 6.0))
		next_state = next
		self.to = _to

	func _to_string():
		return "WanderTo:{0}->{1}".format([to, next_state])

	func recompute():
		path = Global.tilemap.pathfinder.get_point_path(
				owner.get_gridpt(),
				to,
				true,
		)
		next_path_recompute = Time.get_ticks_msec() + RECOMPUTE_TIME

	static func is_close(pa: Vector3, pb: Vector3) -> bool:
		return pa.distance_squared_to(pb) <= CLOSE

	func pop_nearby_pts():
		while path.size() > 0 and is_close(owner.position, Global.tilemap.to_world_point(path[0])):
			path.remove_at(0)

	func tick(_delta: float) -> State:
		if is_close(owner.position, Global.tilemap.to_world_point(to)):
			return next_state
		if Time.get_ticks_msec() >= next_path_recompute:
			recompute()
		pop_nearby_pts()
		if path.size() > 0:
			owner.set_target_gridpt(path[0])
		else:
			owner.target = null
			return next_state
		return null


class BuyFrom extends State:
	var tile: Vector2i

	func _init(_owner: TestCustomer, _tile: Vector2i):
		super(_owner)
		self.tile = _tile

	func _to_string():
		return "BuyFrom:{0}".format([tile])

	func tick(_delta: float) -> State:
		var furni: FurniDisplayCase = Global.tilemap.get_furni(self.tile)
		if not (furni and furni.item and furni.item.stack):
			return ChooseState.new(owner)
		furni.item.store_global_transform()
		owner.item = furni.item
		furni.item = null
		var registers: Array[Vector2i] = \
			Global.tilemap.get_tiles_of_type(preload("res://map/furni_cashregister.gd"))
		if registers.is_empty():
			Global.gold += owner.item.stack.sell_price
			return Leave.new(owner)
		var reg: Vector2i = registers.pick_random()
		return WanderTo.new(owner, reg,
				GiveMoney.new(owner, reg),
		)

class GiveMoney extends State:
	var tile: Vector2i

	func _init(_owner: TestCustomer, _tile: Vector2i):
		super(_owner)
		self.tile = _tile

	func _to_string():
		return "GiveMoney:{0}".format([owner.item.stack])

	func tick(_delta: float) -> State:
		var gold = owner.item.stack.sell_price
		owner.item = null
		Global.gold += gold
		var reg = Global.tilemap.get_furni(tile)
		if reg and reg is FurniCashRegister:
			reg.spawn_particle("$" + str(gold), Color.GREEN)
		return Leave.new(owner)

class ChooseState extends State:
	func _to_string():
		return "ChooseState"

	func tick(_delta: float) -> State:
		var cases: Array[Vector2i] = \
			Global.tilemap.get_tiles_of_type(preload("res://map/furni_displaycase.gd"))
		for case in cases:
			var furni: FurniDisplayCase = Global.tilemap.get_furni(case)
			if furni and furni.item and furni.item.stack:
				return WanderTo.new(owner, case,
						BuyFrom.new(owner, case),
				)
		var new_state := WanderTo.new(owner)
		if owner.time_in_scene > 15.0:
			new_state.next_state = Leave.new(owner)
		return new_state


var time_in_scene := 0.0
var target = null  # null | Vector3
var state: State = ChooseState.new(self)
var item: ItemNode:
	get:
		if $Item.get_child_count() > 0:
			return $Item.get_child(0)
		return null
	set(it):
		while $Item.get_child_count() > 0:
			$Item.remove_child($Item.get_child(0))
		if it:
			if it.is_inside_tree():
				it.reparent($Item, false)
			else:
				$Item.add_child(it)
			it.transform = Transform3D()
			it.animate_to_current_transform()

func set_target_gridpt(v: Vector2i):
	target = Global.tilemap.to_world_point(v)

func get_gridpt(pos = null) -> Vector2i:
	if pos == null:
		pos = position
	return Vector2i(Vector2(pos.x, pos.z).floor())

func _ready():
	Global.request_debug_info.connect(register_debug_info)

func register_debug_info(_dp: DebugPanel):
	DebugPanel.monitor("Customer {0} state".format([self]), self, &"state")

func _physics_process(delta: float) -> void:
	time_in_scene += delta
	var new_state = state.tick(delta)
	while new_state:
		# Loop to give zero-frame delays to things like ChooseState. This somewhat
		# complicates frame timing decisions for some other things like Dwell, but
		# not in ways that matter much.
		print(self, ' enters state ', new_state)
		state = new_state
		new_state = state.tick(delta)

	if target:
		var dir: Vector3 = (position - target).normalized()
		var motion := Vector2(dir.x, dir.z) * movement_speed
		apply_central_force(
				(linear_velocity - Vector3(motion.x, 0, motion.y))\
					.clamp(-Vector3.ONE, Vector3.ONE) * movement_force
		)
		if motion.length_squared() >= 0.3:
			rotation.y += angle_difference(motion.angle(), rotation.y) * turn_speed * delta
