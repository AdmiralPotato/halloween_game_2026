class_name ProgressionEventCounter
extends ProgressionEvent

@export var counter: String = "recipes_used"
@export var property: String = ""
@export var threshold: int = 1

func is_asserted() -> bool:
	return Global.state.get(counter).get(property, 0) >= threshold

func set_from_json(d: Dictionary):
	property = d.recipe
	if "modifiers" in d:
		property += "/" + d.modifiers
	threshold = d.count
