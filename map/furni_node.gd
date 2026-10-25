extends BaseMapNode
class_name FurniNode

var locked := false

## Called to see if this furni can be picked up.
##
## This method defers to the locked member variable; if you add more conditions
## under which the furni can or can't be taken, you may wish to `and super()`
## so that locked is still heeded.
func can_take() -> bool:
	return not locked

## Called when you have been placed on a tile. Also called when you enter the
## scene, if you *are* in place on a Tilemap.
func unpack():
	$StaticBody3D/CollisionShape3D.disabled = false


## Called when you are taken away from a tile, back into someone's hand. Also
## called when you enter the scene, if you *aren't* in place on a Tilemap.

func pack():
	$StaticBody3D/CollisionShape3D.disabled = true
	
	
## Called when the player tries to pick up an item from this tile
func provide_item() -> ItemNode:
	return null
	

## Called when the player tries to place an item on this tile; returns the item
## the player should be holding after this interaction.
func accept_item(item: ItemNode) -> ItemNode:
	return item
	

## Called when the player interacts with this tile.
func interact(_player: Node):
	pass


func _ready():
	if get_parent() is Tilemap:
		unpack()
	else:
		pack()
