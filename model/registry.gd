class_name Registry
extends Resource

@export var items: Dictionary[String, ItemInfo] = {}
@export var recipes: Dictionary[String, Recipe] = {}
@export var furnis: Dictionary[String, FurniInfo] = {}
@export var maps: Dictionary[String, String] = {}

var _items_by_sort: Array[ItemInfo] = []
func get_items_by_sort() -> Array[ItemInfo]:
	if _items_by_sort:
		return _items_by_sort
	_items_by_sort.assign(items.values())
	_items_by_sort.sort_custom(func(a: ItemInfo, b: ItemInfo): return a.sort < b.sort)
	return _items_by_sort

func add_item(i: ItemInfo):
	items[i.name] = i
	
func add_recipe(r: Recipe):
	recipes[r.name] = r

func add_furni(f: FurniInfo):
	furnis[f.name] = f

func add_map(name: String, scene_path: String):
	maps[name] = scene_path
