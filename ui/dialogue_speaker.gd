class_name DialogueSpeaker
extends Resource

## The scene to be instanced at the dialogue place when this speaker is used.
@export var scene: PackedScene
## Path to an AnimationPlayer in the scene to which character_animation will be
## applied.
@export var animator: String
## The default name of this speaker, if none is specified.
@export var name: String
