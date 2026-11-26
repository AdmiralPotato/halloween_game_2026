@abstract
class_name ProgressionEvent
extends Resource

## The name/id of the event, used in debug prints.
@export var name: String = ""
## The full JSON data of the event. This can contain arbitrary parameters
## for running the event.
@export var data: Dictionary = {}
## The method to call when run.
@export var method: String = "log"
## Has this event already run in this scenario?
@export var triggered: bool = false

## Implemented to determine (from the global state) if this event is currently
## triggered.
@abstract
func is_asserted() -> bool

@abstract
func set_from_json(d: Dictionary)

func _to_string() -> String:
	return "ProgressionEvent {}:{}".format([name, data])

func run():
	call(method)

func log():
	print("Would trigger progression event: ", self)

func show_dialog():
	print("Would play dialogue: ", data.get("dialog", "(none)"))

static func from_json(d: Dictionary) -> ProgressionEvent:
	var pe: ProgressionEvent
	match d.trigger_type:
		"MONEY":
			pe = ProgressionEventGold.new()
		"BAKE_NTH_OF_RECIPE_TYPE":
			pe = ProgressionEventCounter.new()
			pe.counter = "recipes_used"
		"NTH_CUSTOMER_PURCHASE_OF_RECIPE_TYPE":
			pe = ProgressionEventCounter.new()
			pe.counter = "purchases_made"
	pe.name = d.trigger_id
	pe.method = d.success_handler
	pe.data = d
	pe.set_from_json(d)
	return pe
