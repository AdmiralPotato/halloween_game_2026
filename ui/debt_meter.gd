extends Control

func _process(delta: float) -> void:
	if $ProgressBar.value != Global.gold:
		$ProgressBar.value = Global.gold
