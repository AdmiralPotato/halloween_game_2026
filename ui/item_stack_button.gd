class_name ItemStackButton
extends TextureButton

@export var stack: ItemStack:
	set(_stack):
		stack = _stack
		if stack:
			texture_normal = ItemNode.render_recipe(stack.item.name, stack.modifiers)
