@tool
class_name GenData
extends EditorScript

# !!!!!!!!!!!!
# README FIRST
# !!!!!!!!!!!!
#
# All of the data in res://models/data is automatically generated; do NOT edit
# it--rather, edit the JSON documents in res://business/ and rerun this script.
#
# You *may* use res://models/data/* paths without fear, so long as you keep the
# .name attributes the same for the semantically same items between runs. uid://
# paths are also permissible but not recommended.

const BASE_PATH = "res://model/data/"
const ITEM_PATH = BASE_PATH + "items/"
const REC_PATH = BASE_PATH + "recipes/"
const FURNI_PATH = BASE_PATH + "furni/"
const REGISTRY_PATH = BASE_PATH + "registry.tres"

static func safe_name(s):
	return RegEx.create_from_string("\\W").sub(s, "_", true)

static func load_json_file(path: String) -> Variant:
	return JSON.parse_string(FileAccess.get_file_as_string(path))

func _run():
	var item_info = load_json_file("res://business/items/food_infos.json")
	var var_info = load_json_file("res://business/items/variant_infos.json")
	var recipe_info = load_json_file("res://business/items/recipes_infos.json")
	var furni_info = load_json_file("res://business/furnis.json")
	var map_info = load_json_file("res://business/maps.json")

	var registry := Registry.new()
	registry.take_over_path(REGISTRY_PATH)

	print('Processing infos...')
	var infos: Dictionary[String, ItemInfo] = {}
	for name in item_info:
		infos[name] = ItemInfo.from_json(name, item_info[name], var_info)
		infos[name].take_over_path(ITEM_PATH + safe_name(name) + ".tres")
		registry.add_item(infos[name])
	print('Writing infos...')
	for info in infos.values():
		ResourceSaver.save(info)

	print('Processing recipes...')
	var recipes: Dictionary[String, Recipe] = {}
	for desc in recipe_info:
		#print('Processing recipe...', desc.human_name)
		var recipe = Recipe.from_json(desc, func(n: String): return infos[n])
		assert(
			not recipe.name in recipes,
			"Recipe {0} already defined; each recipe must have a unique name"\
			.format([recipe.name])
		)
		recipes[recipe.name] = recipe
		recipe.take_over_path(REC_PATH + safe_name(recipe.name) + ".tres")
		registry.add_recipe(recipes[recipe.name])

	print('Writing recipes...')
	for recipe in recipes.values():
		ResourceSaver.save(recipe)

	print('Processing furniture...')
	var furnis: Dictionary[String, FurniInfo] = {}
	for name in furni_info:
		var furni = FurniInfo.from_json(name, furni_info[name])
		furnis[name] = furni
		furni.take_over_path(FURNI_PATH + safe_name(furni.name) + ".tres")
		registry.add_furni(furni)

	print('Writing furniture...')
	for furni in furnis.values():
		ResourceSaver.save(furni)
	
	print('Processing maps...')
	for name in map_info:
		registry.add_map(name, map_info[name].path)
	
	print('Writing the registry...')
	ResourceSaver.save(registry)

	print('Done!')
