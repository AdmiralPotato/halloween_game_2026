class_name ItemStack
extends Resource

## The kind of item in this stack.
@export var item: ItemInfo
## How many items are in this stack.
@export_range(0, 50, 1, "or_greater") var count: int = 1
## The sum of all attributes vectors for items that contributed to this stack,
## either in base or through Recipes.
@export var combined_attributes: Dictionary[ItemInfo.Attribute, int] = {}
## Modifiers (extra ingredients optional in some Recipes).
@export var modifiers: Array[ItemStack] = []
## A stack of items inside this stack (relevant for CONTAINER items).
@export var contents: ItemStack = null

func _init(item: ItemInfo, count: int = 1):
	self.item = item
	self.count = count
	for attr in item.attributes:
		combined_attributes[attr] = item.attributes[attr] * count
