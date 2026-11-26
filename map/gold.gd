extends Label


func _ready():
	Global.state.changed.connect(refresh)
	refresh()
	
func refresh():
	text = str(Global.state.gold)
