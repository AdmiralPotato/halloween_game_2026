extends BaseMapNode
class_name ItemNode

@export var stack: ItemStack:
	set(v):
		stack = v
		if stack:
			$Sprite.texture = stack.item.texture
			$Count.text = str(stack.count)
			$Count.visible = stack.count > 1
