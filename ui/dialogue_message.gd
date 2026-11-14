class_name DialogueMessage
extends Resource

const SPEAKER_ROOT = "res://model/data/speakers/"

## The dialogue text to display.
@export var message: String
## Dialogue type-out rate in characters per second.
@export var speed: float = 15.0
## The speaker to be displayed.
@export var speaker: DialogueSpeaker
## The speaker name to be displayed, overriding the default for the speaker.
@export var speaker_name: String
## Where to display the speaker.
@export var speaker_place: String
## An animation to play on the speaker, if any.
@export var speaker_anim: String

static func from_json(d: Dictionary) -> DialogueMessage:
	var msg := DialogueMessage.new()
	msg.message = d.get("message", "")
	msg.speed = d.get("speed", 15.0)
	msg.speaker = load(SPEAKER_ROOT + d.character_id + ".tres") \
			if "character_id" in d else null
	msg.speaker_name = d.get("speaker_label", "")
	msg.speaker_place = d.get("character_side", "")
	msg.speaker_anim = d.get("character_anim", "")
	return msg
