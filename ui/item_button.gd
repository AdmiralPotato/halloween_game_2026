class_name ItemButton
extends TextureButton

@export var item: ItemInfo:
	set(info):
		item = info
		if item:
			texture_normal = ItemNode.render_simple_item_texture_by_name(item.name)
