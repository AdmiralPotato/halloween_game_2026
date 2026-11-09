extends PanelContainer

var stylebox: StyleBoxFlat
func _ready() -> void:
	stylebox = get_theme_stylebox("Panel")


var tween: Tween
func flash(color: Color = Color.RED):
	print("flash")
	if tween:
		tween.kill()
	tween = create_tween()
	stylebox.bg_color = color
	var fade_color = Color(color, 0.0)
	tween.tween_property(stylebox, ^"bg_color", fade_color, 0.5)
