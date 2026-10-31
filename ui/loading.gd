extends CenterContainer

const LOADING_TEXT = [
	"Baking Cakes...",
	"Baking Cookies...",
	"Rearranging Kitchen...",
	"Decorating Cakes...",
	"Mixing Frosting...",
	"Coloring Sprites...",
	"Chopping Chocolate...",
	"Reticulating Splines...",
]

@export var spin_speed: float = TAU
@export_file("*.tscn") var next_scene: String

var started_load := false

var _shuffled_messages: Array[String] = []
func get_next_loading_message() -> String:
	if not _shuffled_messages:
		_shuffled_messages.assign(LOADING_TEXT)
		_shuffled_messages.shuffle()
	return _shuffled_messages.pop_back()


func _ready() -> void:
	%ProgressText.text = get_next_loading_message()


func begin_load():
	started_load = true
	ResourceLoader.load_threaded_request(next_scene, "PackedScene", true)


func _process(delta: float) -> void:
	if Input.is_action_just_pressed("debug"):
		loading_finished()
		return
	var progress = []
	var result := ResourceLoader.load_threaded_get_status(next_scene, progress)
	match result:
		ResourceLoader.ThreadLoadStatus.THREAD_LOAD_FAILED:
			error_occurred("resource load failed")
		ResourceLoader.ThreadLoadStatus.THREAD_LOAD_INVALID_RESOURCE:
			if started_load:
				error_occurred("load resulted in invalid resource")
		ResourceLoader.ThreadLoadStatus.THREAD_LOAD_LOADED:
			loading_finished()
		ResourceLoader.ThreadLoadStatus.THREAD_LOAD_IN_PROGRESS:
			%Spinner.offset_transform_rotation += delta * spin_speed
			%ProgressBar.value = progress[0]


func error_occurred(ctx: String = "unknown error occurred"):
	$ErrorDialog.dialog_text = $ErrorDialog.dialog_text.format({error = ctx})
	$ErrorDialog.popup_centered_clamped()
	$MessageTimer.stop()


func loading_finished():
	set_process(false)
	%ProgressBar.value = 1.0
	$MessageTimer.stop()
	%ProgressText.text = "Loading Textures..."
	#$StartSwitch.start()
	_on_start_switch_timeout()  # ???


func _on_message_timer_timeout() -> void:
	%ProgressText.text = get_next_loading_message()


func _on_error_dialog_confirmed() -> void:
	get_tree().quit(7)


func _on_start_load_timeout() -> void:
	begin_load()


func _on_start_switch_timeout() -> void:
	print('switching to ', next_scene)
	var next: PackedScene = ResourceLoader.load_threaded_get(next_scene)
	if not next:
		error_occurred("scene could not be read")
	match get_tree().change_scene_to_packed(next):
		OK:
			pass
		_:
			error_occurred("scene could not be switched to")
