class_name GlobalState
extends Resource

@export var gold: int = 10_000:
	set(new):
		gold = new
		emit_changed()

# "Counters"
@export var recipes_used: Dictionary = {}
@export var purchases_made: Dictionary = {}

@export var progress: ProgressionHandler = ProgressionHandler.new()

func _init():
	changed.connect(_on_changed)

func _on_changed():
	# keep this indirection here, since progress can be reassigned
	progress.run_events()

func to_keys(stack: ItemStack) -> PackedStringArray:
	var key: String = stack.item.name
	var res := PackedStringArray([key])
	var mods := stack.modifier_cardinality
	if mods:
		key += "/"
		var elems := PackedStringArray()
		for mod in mods:
			elems.append(mod.name)
		key += ",".join(elems)
		res.append(key)
	return res

func inc_counter(counter: StringName, stack: ItemStack):
	var ctr: Dictionary = get(counter)
	for key in to_keys(stack):
		ctr[key] = ctr.get(key, 0) + 1
	emit_changed()

func inc_counter_string(counter: StringName, key: String):
	var ctr: Dictionary = get(counter)
	ctr[key] = ctr.get(key, 0) + 1
	emit_changed()

func get_save_state() -> Dictionary:
	return {
		gold = gold,
		recipes_used = recipes_used,
		purchases_made = purchases_made,
	}

func set_save_state(d: Dictionary):
	gold = d.get("gold", 10000)
	recipes_used = d.get("recipes_used", {})
	purchases_made = d.get("purchases_made", {})
