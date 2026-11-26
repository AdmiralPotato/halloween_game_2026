extends Control

func _process(delta: float) -> void:
	if $ProgressBar.value != Global.state.gold:
		$ProgressBar.value = Global.state.gold
