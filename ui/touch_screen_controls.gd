extends Control

func _process(delta: float) -> void:
	$ToggleParent.visible = Global.show_touch_ui
	$ToggleParent/MarginContainerCamera/VSlider.value = Global.camera_zoom * 100

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("toggle_touch_ui"):
		Global.show_touch_ui = !Global.show_touch_ui
		$ToggleParent.visible = Global.show_touch_ui


func _on_v_slider_value_changed(value: float) -> void:
	Global.camera_zoom = value / 100
