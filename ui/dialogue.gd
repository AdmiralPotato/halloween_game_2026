extends PanelContainer

const PLACE_TO_SIZE_FLAG = {
	LEFT = SizeFlags.SIZE_SHRINK_BEGIN,
	CENTER = SizeFlags.SIZE_SHRINK_CENTER,
	RIGHT = SizeFlags.SIZE_SHRINK_END,
}
const FADE_TIME = 0.5

signal displaying
signal stopped
signal displayed

@export var dialogue_scene: DialogueScene
var current_index: int = 0
var shown_timebase: float = 0.0
var cps: float = 15.0


func _ready() -> void:
	if dialogue_scene:
		start()


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept") or event.is_action_pressed("ui_right"):
		advance()
	elif event.is_action_pressed("ui_left"):
		rewind()


func start(scn: DialogueScene = null):
	if scn:
		dialogue_scene = scn
	show()
	modulate = Color.TRANSPARENT
	var tween = create_tween()
	tween.tween_property(self, ^"modulate", Color.WHITE, FADE_TIME)
	current_index = 0
	display(dialogue_scene.messages[current_index])


func stop():
	var tween = create_tween()
	tween.tween_property(self, ^"modulate", Color.TRANSPARENT, FADE_TIME)
	tween.tween_callback(hide)
	stopped.emit()


func advance():
	current_index += 1
	if (not dialogue_scene) or current_index >= len(dialogue_scene.messages):
		stop()
	else:
		display(dialogue_scene.messages[current_index])


func rewind():
	if current_index > 0:
		current_index -= 1
	display(dialogue_scene.messages[current_index])


func display(msg: DialogueMessage):
	displaying.emit()
	
	# Clear places
	for place in %Places.get_children():
		while place.get_child_count() > 0:
			place.remove_child(place.get_child(0))
	
	# Instantiate actor scenes
	var place = msg.speaker_place if msg.speaker_place else "CENTER"
	if msg.speaker:
		var node = msg.speaker.scene.instantiate()
		%Places.get_node(place).add_child(node)
		if msg.speaker_anim:
			node.get_node(msg.speaker.animator).play(msg.speaker_anim)
	
	# Set text nodes
	var spkr_name = msg.speaker_name if msg.speaker_name else (
			msg.speaker.name if msg.speaker else ""
	)
	%SpeakerPanel.modulate = Color.WHITE if spkr_name else Color.TRANSPARENT
	%SpeakerPanel.size_flags_horizontal = PLACE_TO_SIZE_FLAG.get(
			place, SIZE_SHRINK_CENTER
	)
	%SpeakerText.text = spkr_name
	%DialogueText.text = msg.message
	%DialogueText.visible_characters = 0
	cps = msg.speed if msg.speed > 0.0 else 15.0
	shown_timebase = 0.0


func _process(delta: float) -> void:
	shown_timebase += delta
	if %DialogueText.visible_ratio < 1.0:
		%DialogueText.visible_characters = int(shown_timebase * cps)
		if %DialogueText.visible_ratio >= 1.0:
			displayed.emit()
	
