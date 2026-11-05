@tool
class_name FurniInfo
extends Resource

## The display name for this furniture node.
@export var name: String
## A scene that instantiates a Node which is a subclass of FurniNode.
@export var scene: PackedScene
## The cost to purchase this furniture node.
@export_range(0, 1000, 1, "or_greater") var cost: int = 100

static func from_json(name: String, d: Dictionary) -> FurniInfo:
	var furni = FurniInfo.new()
	furni.name = name
	furni.cost = d.get("cost", 0)
	furni.scene = load(d.path)
	return furni
