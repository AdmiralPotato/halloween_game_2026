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

static func safe_name(s):
	return RegEx.create_from_string("\\W").sub(s, "_", true)

func _run():
	var item_info = JSON.parse_string(
			FileAccess.get_file_as_string("res://business/items/food_infos.json")
	)
	var var_info = JSON.parse_string(
			FileAccess.get_file_as_string("res://business/items/variant_infos.json")
	)
	var recipe_info = JSON.parse_string(
			FileAccess.get_file_as_string("res://business/items/recipes_infos.json")
	)
	
	print('Loading items...')
	var infos: Dictionary[String, ItemInfo] = {}
	for name in item_info:
		infos[name] = ItemInfo.from_json(name, item_info[name], var_info)
		infos[name].take_over_path(ITEM_PATH + safe_name(name) + ".tres")
		
	print('Loading recipes...')
	var recipes: Dictionary[String, Recipe] = {}
	for desc in recipe_info:
		var recipe = Recipe.from_json(desc, func(n: String): return infos[n])
		if recipe.name in recipes:
			push_error(
					"Recipe {0} already defined; each recipe must have a unique name"\
					.format([recipe.name])
			)
			return
		recipes[recipe.name] = recipe
		recipe.take_over_path(REC_PATH + safe_name(recipe.name) + ".tres")
	
	print('Writing resources...')
	for info in infos.values():
		ResourceSaver.save(info)
	for recipe in recipes.values():
		ResourceSaver.save(recipe)
		
	print('Done!')
