@tool
class_name FurniTrash
extends FurniCountertop

func set_item(it: ItemNode):
	super(it)
	if it:
		it.finished_animating.connect(animate_remove.bind(it), CONNECT_ONE_SHOT)

func animate_remove(_item: ItemNode):
	var tweenola := _item.create_tween()
	tweenola.tween_property(_item, "transform", Transform3D(Basis().scaled(Vector3.ONE * 0.1), -Vector3.UP), 0.2)
	tweenola.tween_callback(do_remove.bind(_item))

func do_remove(it: ItemNode):
	if it.get_parent() == $Item:
		it.queue_free()
