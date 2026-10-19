@abstract
extends Node3D
class_name FurniNode
@export var item_height = 1;

var tween: Tween

## Return true if the given item can be placed on/in this furniture.
@abstract
func item_can_fit(other_item: ItemNode) -> bool;

## Called when you have been placed on a tile. Also called when you enter the
## scene, if you *are* in place on a Tilemap.
func unpack():
	if tween:
		tween.kill()
	# Become smolbig; start tiny but not zero or physics throws warns
	scale = Vector3.ONE * 0.001
	tween = self.create_tween()
	tween.set_trans(Tween.TRANS_SINE)
	tween.tween_property(self, "scale", Vector3.ONE, 0.2)
	$StaticBody3D/CollisionShape3D.disabled = false

## Called when you are taken away from a tile, back into someone's hand. Also
## called when you enter the scene, if you *aren't* in place on a Tilemap.

func pack():
	# Become smol
	scale = Vector3(0.5, 0.5, 0.5)
	$StaticBody3D/CollisionShape3D.disabled = true


func _ready():
	if get_parent() is Tilemap:
		unpack()
	else:
		pack()
