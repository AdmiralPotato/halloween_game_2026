extends FurniNode
class_name FurniCountertop
@export var item_height = 1;

var tween: Tween

func item_can_fit(other_item: ItemNode) -> bool:
	# Any item can fit on a countertop
	return true

func unpack():
	if tween:
		tween.kill()
	# Become smolbig
	scale = Vector3(0.0, 0.0, 0.0)
	tween = self.create_tween()
	tween.set_trans(Tween.TRANS_SINE)
	tween.tween_property(self, "scale", Vector3(1.0, 1.0, 1.0), 0.2)
	$StaticBody3D/CollisionShape3D.disabled = false

func pack():
	# Become smol
	scale = Vector3(0.5, 0.5, 0.5)
	$StaticBody3D/CollisionShape3D.disabled = true
