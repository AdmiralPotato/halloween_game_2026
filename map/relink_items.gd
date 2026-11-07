## Attempt to fix any unique ItemInfos by relinking them to the ItemInfo resources
## already in the tree. You MUST run this with the map or scene currently open
## and selected. (This can take a while!)
@tool
class_name RelinkItems
extends EditorScript


# Called when the script is executed (using File -> Run in Script Editor).
func _run() -> void:
	var root := EditorInterface.get_edited_scene_root()
	var registry: Registry = load("res://model/data/registry.tres")
	print('(registry loaded)')
	visit_node(root, registry)

func visit_node(node: Node, reg: Registry):
	print('- ', node.get_path())
	if not node.owner:
		print('  (skipped--not saved)')
		#return  # not saved in the scene
	visit_object(node, reg)
	for child in range(node.get_child_count()):
		visit_node(node.get_child(child), reg)
	
func visit_object(ob: Object, reg: Registry):
	if ob == null:
		return
	var props := ob.get_property_list()
	for prop in props:
		if prop.usage & PROPERTY_USAGE_STORAGE:
			visit_property(ob, prop.name, reg)
			
func visit_property(ob: Object, name: String, reg: Registry):
	#print('  - ', name)
	var pval: Variant = ob.get(name)
	var pnew: Array = process_value(pval, reg)
	if pnew[0]:
		#print('     (updated)')
		print('  - ', name, ' updated')
		ob.set(name, pnew[1])

func process_value(v: Variant, reg: Registry) -> Array:
	match typeof(v):
		TYPE_ARRAY:
			var any_set: bool = false
			for index in range(len(v)):
				var res := process_value(v[index], reg)
				if res[0]:
					v[index] = res[1]
					any_set = true
			return [any_set, v]
		TYPE_DICTIONARY:
			var any_set: bool = false
			for index in v:
				var res := process_value(v[index], reg)
				if res[0]:
					v[index] = res[1]
					any_set = true
			return [any_set, v]
		TYPE_OBJECT:
			if v is ItemInfo:
				return handle_item_info(v, reg)
			else:
				visit_object(v, reg)
				return [false, null]
		_:
			return [false, null]

func handle_item_info(info: ItemInfo, reg: Registry) -> Array:
	print('     - Found leaf ItemInfo ', info.name)
	if info.resource_path.begins_with('uid://'):
		print('      (is UID reference)')
		return [false, null]
	elif info.resource_path.begins_with('res://'):
		if '::' in info.resource_path.substr(6):
			print('      (is scene-local with SCUID ', info.resource_scene_unique_id, ')')
			return [true, registry_resolve(info.name, reg)]
		else:
			print('      (is a file reference with SCUID ', info.resource_scene_unique_id, ')')
			return [false, null]
	else:
		print('      (not sure where this is stored: ', info.resource_path, '::', info.resource_scene_unique_id, ')')
		return [true, registry_resolve(info.name, reg)]

func registry_resolve(name: String, reg: Registry) -> ItemInfo:
	return reg.items[name]
