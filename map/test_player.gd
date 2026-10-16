extends RigidBody3D

## How much force the birb can apply on a given axis
@export var movement_force := 7.0
## How fast the birb wants to go when a given axis is maxed out
@export var movement_speed := 4.0
## How fast the birb wants to turn in RADIANS per second
@export var turn_speed := TAU

func _physics_process(delta):
	var desired_x_motion := Input.get_axis("move_left", "move_right") * movement_speed
	var desired_z_motion := Input.get_axis("move_up", "move_down") * movement_speed
	self.constant_force = Vector3(
			clamp(desired_x_motion - self.linear_velocity.x, -1.0, 1.0),
			0.0,
			clamp(desired_z_motion - self.linear_velocity.z, -1.0, 1.0),
	) * movement_force
	if Vector2(desired_x_motion, desired_z_motion).length() > 0.1:
		var desired_facing = atan2(desired_x_motion, desired_z_motion)
		var facing_delta = angle_difference(self.rotation.y, desired_facing)
		self.rotation.y += facing_delta * turn_speed * delta
