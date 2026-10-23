class_name Registry
extends Resource

@export var items: Dictionary[String, ItemInfo] = {}
@export var recipes: Dictionary[String, Recipe] = {}

func add_item(i: ItemInfo):
	items[i.name] = i
	
func add_recipe(r: Recipe):
	recipes[r.name] = r
