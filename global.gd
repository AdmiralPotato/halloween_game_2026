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
@onready var registry: Registry = load("res://model/data/registry.tres")

signal request_debug_info(panel: DebugPanel)
signal gold_changed

func _ready():
	request_debug_info.connect(register_debug_info)
	
func register_debug_info(dp: DebugPanel):
	dp.monitor("gold", self, &"gold", 30)
