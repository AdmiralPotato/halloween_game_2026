@tool
class_name FurniTrash
extends FurniCountertop

func get_save_state() -> Dictionary:
	var save := super()
	save.erase('item')
	return save

func set_item(it: ItemNode):
	super(it)
	if it:
		it.finished_animating.connect(animate_remove.bind(it), CONNECT_ONE_SHOT)

func swap(other: FurniNode) -> Dictionary:
	other.reparent($Item)
	other.store_global_transform()
	other.transform = Transform3D().scaled(Vector3.ONE * TestPlayer.SMOL_FURNI)
	# .animate_to_transform is called by TestPlayer._physics_process after `null`
	# is returned below--don't call it again, the tweens will fight
	other.finished_animating.connect(animate_remove.bind(other), CONNECT_ONE_SHOT)
	return {returned_node = null}

func animate_remove(_item: BaseMapNode):
	var tweenola := _item.create_tween()
	tweenola.tween_property(_item, "transform", Transform3D(Basis().scaled(Vector3.ONE * 0.1), -Vector3.UP), 0.2)
	tweenola.tween_callback(do_remove.bind(_item))

func do_remove(it: BaseMapNode):
	if it.get_parent() == $Item:
		it.queue_free()
