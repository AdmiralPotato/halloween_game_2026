extends Node

var debug_panel: DebugPanel:
	set(new):
		debug_panel = new
		if new:
			request_debug_info.emit(new)
var tilemap: Tilemap
var gold: int = 10_000:
	set(new):
		gold = new
		gold_changed.emit()
var show_touch_ui := true

@onready var registry: Registry = load("res://model/data/registry.tres")
var scene_change_info: Dictionary = {}

signal request_debug_info(panel: DebugPanel)
signal gold_changed

func _ready():
	request_debug_info.connect(register_debug_info)
	
func register_debug_info(_dp: DebugPanel):
	DebugPanel.monitor("gold", self, &"gold", 30)

func get_save_state() -> Dictionary:
	var map: String
	if 'path' in scene_change_info:
		map = scene_change_info.path
	else:
		map = '???'  # TODO: figure out how to get the PackedScene path for the tree root
	return {
		map = map,
		state = (get_tree().current_scene as BaseMap).get_save_state()
	}

func set_save_state(save: Dictionary):
	get_tree().change_scene_to_file(save.map)
	await get_tree().scene_changed
	get_tree().current_scene.set_save_state(save.state)
