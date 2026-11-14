class_name DialogueScene
extends Resource

## An array of messages to display, starting at the first.
@export var messages: Array[DialogueMessage] = []

static func from_json(a: Array) -> DialogueScene:
	var scn := DialogueScene.new()
	for elem in a:
		scn.messages.append(DialogueMessage.from_json(elem))
	return scn
