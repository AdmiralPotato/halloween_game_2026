@abstract
extends Node3D
class_name FurniNode

@export var item_height = 1;

## Return true if the given item can be placed on/in this furniture.
@abstract
func item_can_fit(other_item: ItemNode) -> bool;

## Called when you have been placed on a tile. Also called when you enter the
## scene, if you *are* in place on a Tilemap.
func unpack():
	$StaticBody3D/CollisionShape3D.disabled = false


## Called when you are taken away from a tile, back into someone's hand. Also
## called when you enter the scene, if you *aren't* in place on a Tilemap.

func pack():
	$StaticBody3D/CollisionShape3D.disabled = true


func _ready():
	if get_parent() is Tilemap:
		unpack()
	else:
		pack()
