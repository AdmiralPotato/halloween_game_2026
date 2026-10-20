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
	
	func _init(owner: TestCustomer):
		self.owner = owner
		
	@abstract func tick(delta: float) -> State
	
	
class Leave extends State:
	func tick(delta: float) -> State:
		owner.queue_free()
		return null
		
	
class Dwell extends State:
	var until: float
	
	func _init(owner: TestCustomer, duration: float):
		super(owner)
		until = owner.time_in_scene + duration
		
	func tick(delta: float) -> State:
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
	
	func _init(owner: TestCustomer, to: Vector2i = NOWHERE, next: State = null):
		super(owner)
		if to == NOWHERE:
			to = Global.tilemap.pick_open_point()
		if not next:
			next = Dwell.new(owner, randf_range(2.0, 6.0))
		next_state = next
		self.to = to
		
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
		while path.size() > 0 and is_close(owner.position, owner.to_worldpt(path[0])):
			path.remove_at(0)
		
	func tick(delta: float) -> State:
		if is_close(owner.position, owner.to_worldpt(to)):
			return next_state
		if Time.get_ticks_msec() >= next_path_recompute:
			recompute()
		pop_nearby_pts()
		if path.size() > 0:
			owner.set_target_gridpt(path[0])
		else:
			owner.target = null
		return null
		

class ChooseState extends State:
	func tick(delta: float) -> State:
		# TODO: figure out what we want to do
		var new_state := WanderTo.new(owner)
		if owner.time_in_scene > 15.0:
			new_state.next_state = Leave.new(owner)
		return new_state
	
	
var time_in_scene := 0.0
var target = null  # null | Vector3
var state: State = ChooseState.new(self)
	
func to_worldpt(v: Vector2i) -> Vector3:
	return Vector3(v.x + 0.5, 0, v.y + 0.5)
	
func set_target_gridpt(v: Vector2i):
	target = to_worldpt(v)
	
func get_gridpt(pos = null) -> Vector2i:
	if pos == null:
		pos = position
	return Vector2i(Vector2(pos.x, pos.z).floor())

func _physics_process(delta: float) -> void:
	time_in_scene += delta
	var new_state = state.tick(delta)
	while new_state:
		# Loop to give zero-frame delays to things like ChooseState. This somewhat
		# complicates frame timing decisions for some other things like Dwell, but
		# not in ways that matter much.
		state = new_state
		new_state = state.tick(delta)
		
	if target:
		var dir: Vector3 = (position - target).normalized()
		var motion := Vector2(dir.x, dir.z) * movement_speed
		constant_force = (Vector3(motion.x, 0, motion.y) - linear_velocity)\
				.clamp(-Vector3.ONE, Vector3.ONE) * movement_force
		if motion.length_squared() >= 0.3:
			rotation.y += angle_difference(motion.angle(), rotation.y) * turn_speed * delta
