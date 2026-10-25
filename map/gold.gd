extends Label


func _ready():
	Global.gold_changed.connect(refresh)
	refresh()
	
func refresh():
	text = str(Global.gold)
