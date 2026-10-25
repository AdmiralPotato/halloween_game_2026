class_name FurniTash
extends FurniCountertop

func set_item(it: ItemNode):
	super(it)
	if it:
		it.finished_animating.connect(animate_remove.bind(it), CONNECT_ONE_SHOT)

func animate_remove(it: ItemNode):
	var tween := it.create_tween()
	tween.tween_property(it, "transform", Transform3D(Basis().scaled(Vector3.ONE * 0.1), -Vector3.UP), 0.2)
	tween.tween_callback(do_remove.bind(it))
	
func do_remove(it: ItemNode):
	if it.get_parent() == $Item:
		it.queue_free()
