extends PanelContainer


var stylebox: StyleBoxFlat
var default_background_color: Color = Color(0, 0, 0, 0.5)
func _ready() -> void:
	stylebox = StyleBoxFlat.new()
	stylebox.bg_color = default_background_color
	add_theme_stylebox_override("panel", stylebox)


var tween: Tween
func flash():
	print("flash")
	if tween:
		tween.kill()
	tween = create_tween()
	stylebox.bg_color = Color.RED
	tween.tween_property(stylebox, ^"bg_color", default_background_color, 0.5)
