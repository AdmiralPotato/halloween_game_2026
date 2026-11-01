class_name ItemButton
extends TextureButton

@export var item: ItemInfo:
	set(info):
		item = info
		if item and item.texture:
			texture_normal = item.texture
