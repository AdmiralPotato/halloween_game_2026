class_name FurniTash
extends FurniCountertop

func set_item(it: ItemNode):
	super(it)
	if it:
		it.finished_animating.connect(it.queue_free, CONNECT_ONE_SHOT)
