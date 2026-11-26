class_name ProgressionEventGold
extends ProgressionEvent

@export var threshold: int = 1

func is_asserted() -> bool:
	return Global.state.gold >= threshold

func set_from_json(d: Dictionary):
	threshold = d.value
