class_name ProgressionHandler
extends Resource

@export var events: Array[ProgressionEvent] = []

signal completed_event(event: ProgressionEvent)
signal completed_all

static func from_json(a: Array) -> ProgressionHandler:
	var ph = ProgressionHandler.new()
	for ent in a:
		ph.events.append(ProgressionEvent.from_json(ent))
	return ph

static func from_string(s: String) -> ProgressionHandler:
	return from_json(JSON.parse_string(s))

static func from_path(p: String) -> ProgressionHandler:
	return from_string(FileAccess.get_file_as_string(p))

func run_events():
	print("run_events")
	var triggered := 0
	for ev in events:
		if ev.triggered:
			triggered += 1
			continue
		if ev.is_asserted():
			ev.triggered = true
			ev.run()
			completed_event.emit(ev)
			triggered += 1
	if triggered == events.size():
		completed_all.emit()
	
