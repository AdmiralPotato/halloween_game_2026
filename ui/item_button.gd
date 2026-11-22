class_name ItemButton
extends TextureButton

@export var item: ItemInfo:
	set(info):
		item = info
		if item:
			if item.name == 'pale_liner':
				print('aaaaaaaaaaaa')
			texture_normal = ItemNode.render_simple_item_texture_by_name(item.name)
