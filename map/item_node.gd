@tool
extends BaseMapNode
class_name ItemNode

# Attend the slight circular dependency where we have to refer to the scene to
# which we are attached as a script; for this reason, don't just preload this.
const ITEM_RESOURCE := "res://map/ItemNode.tscn"
static var item_scene: PackedScene = null
static func make_node(stack: ItemStack) -> ItemNode:
	if not item_scene:
		item_scene = load(ITEM_RESOURCE)
	if not stack:
		# This is _almost_ never what you want.
		push_warning("Tried to create an ItemNode with empty stack!")
		return null
	var node = item_scene.instantiate()
	node.stack = stack.duplicate()
	return node

@export var stack: ItemStack:
	set(v):
		if stack:
			stack.changed.disconnect(update_stack_rendering)
		stack = v
		if stack:
			stack.changed.connect(update_stack_rendering, CONNECT_DEFERRED)
		update_stack_rendering()


func update_stack_rendering():
	if not (is_node_ready() and $Sprite and $Count):
		# Child nodes aren't yet available--defer a call instead.
		ready.connect(update_stack_rendering, CONNECT_ONE_SHOT | CONNECT_DEFERRED)
		return
	if stack and stack.item:
		$Sprite.texture = stack.item.texture
		$Count.text = str(stack.count)
		$Count.visible = stack.count > 1
	else:
		$Sprite.texture = PlaceholderTexture2D.new()
		($Sprite.texture as PlaceholderTexture2D).size = Vector2(256, 256)
		$Count.text = '0'
		$Count.visible = true
