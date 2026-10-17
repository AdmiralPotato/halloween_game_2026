class_name DebugPanel extends Control

class Monitored:
	var node: Node;
	var property: StringName;
	var label_string: StringName;
	var label_node: Label;
	var interval: int;

static var monitored_properties: Dictionary[StringName, Monitored]
static var labels_in_order: Array[StringName]
var frame_count := 0

func _ready() -> void:
	if Global.debug_panel:
		Global.debug_panel.queue_free()
	Global.debug_panel = self
	for label in monitored_properties:
		monitored_properties[label].label_node = null
	visible = false

func _input(event) -> void:
	if event.is_action_pressed("debug"):
		visible = not visible
		get_viewport().set_input_as_handled()

func _process(_delta) -> void:
	frame_count += 1
	if visible:
		var props_to_delete: Array[StringName] = []
		for label in labels_in_order:
			var monitored: Monitored = monitored_properties.get(label)
			if !monitored.node:
				props_to_delete.push_front(label)
				continue
			if !monitored.label_node:
				monitored.label_node = Label.new()
				monitored.label_node.text = ""
				$PanelContainer/VBoxContainer.add_child(monitored.label_node)
			if frame_count % monitored.interval != 0 && monitored.label_node.text.length() > 0: continue
			var value = monitored.node[monitored.property]
			if value is Callable:
				value = value.call()
			if label.contains("%"):
				monitored.label_node.text = label % value
			else:
				monitored.label_node.text = "%s: %s" % [label, str(value)]
		for label in props_to_delete:
			monitored_properties.erase(label)
			labels_in_order.erase(label)

static func monitor(label: StringName, node: Node, property: StringName, interval: int = 1):
	if interval < 1: interval = 1
	var monitored: Monitored = monitored_properties.get(label)
	if !monitored:
		labels_in_order.push_back(label)
		monitored = Monitored.new()
		monitored.label_string = label
		monitored_properties.set(label, monitored)
	monitored.node = node
	monitored.property = property
	monitored.interval = interval
