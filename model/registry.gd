class_name Registry
extends Resource

@export var items: Dictionary[String, ItemInfo] = {}
@export var recipes: Dictionary[String, Recipe] = {}
@export var furnis: Dictionary[String, FurniInfo] = {}
@export var maps: Dictionary[String, String] = {}

func get_items_by_sort(category: ItemInfo.Category) -> Array[ItemInfo]:
	var result = items.values()
	result.sort_custom(func(a: ItemInfo, b: ItemInfo): return a.sort < b.sort)
	return result.filter(func(i): return i.is_category(category))

func add_item(i: ItemInfo):
	items[i.name] = i

func add_recipe(r: Recipe):
	recipes[r.name] = r

func add_furni(f: FurniInfo):
	furnis[f.name] = f

func add_map(name: String, scene_path: String):
	maps[name] = scene_path
