@tool
extends BaseMapNode
class_name ItemNode

# Attend the slight circular dependency where we have to refer to the scene to
# which we are attached as a script; for this reason, don't just preload this.
const ITEM_RESOURCE := "res://map/ItemNode.tscn"
static var item_scene: PackedScene = null
static func make_node(_stack: ItemStack) -> ItemNode:
	if not item_scene:
		item_scene = load(ITEM_RESOURCE)
	if not _stack:
		# This is _almost_ never what you want.
		push_warning("Tried to create an ItemNode with empty _stack!")
		return null
	var node = item_scene.instantiate()
	node.stack = _stack.duplicate(true)
	return node


func _ready():
	update_stack_rendering()


func _to_string() -> String:
	return "ItemNode {name}:{stack}".format({
		name = name,
		stack = stack,
	})


@export var stack: ItemStack:
	set(v):
		if stack:
			stack.changed.disconnect(update_stack_rendering)
		stack = v
		if stack:
			stack.changed.connect(update_stack_rendering, CONNECT_DEFERRED)
		update_stack_rendering()

const BASE_SCALE = 0.8
func update_stack_rendering():
	if not (has_node(^"Sprite") and has_node(^"Count")):
		# Child nodes aren't yet available--defer a call instead.
		if not Engine.is_editor_hint():
			ready.connect(update_stack_rendering, CONNECT_ONE_SHOT | CONNECT_DEFERRED)
		return
	if stack:
		if stack.item:
			if stack.item.texture:
				$Sprite.texture = stack.item.texture
			if stack.item.texture_layers:
				$Sprite.texture = make_procedural_texture(stack)
			$Count.text = str(stack.count)
			$Count.visible = stack.count > 1
		for child in $Contents.get_children():
			child.queue_free()
		var filtered_contents := stack.contents.filter(
				func(s: ItemStack): return s != null
		)
		var contents_size := filtered_contents.size()
		var cols := int(ceil(sqrt(contents_size)))
		var index := 0
		for contained in filtered_contents:
			var cell = Vector2i(index % cols, floor(float(index) / cols))
			index += 1
			var node = make_node(contained)
			$Contents.add_child(node)
			node.transform = Transform3D(
				Basis().scaled(Vector3.ONE * BASE_SCALE / cols),
				(Vector3(-1, 0, -1) * BASE_SCALE / 2 \
					if cols > 1 else Vector3.ZERO) + \
				Vector3(cell.x, 0, cell.y) * BASE_SCALE / max(cols - 1, 1),
			)
	else:
		$Sprite.texture = PlaceholderTexture2D.new()
		($Sprite.texture as PlaceholderTexture2D).size = Vector2(256, 256)
		$Count.text = '0'
		$Count.visible = true

func make_procedural_texture(_stack: ItemStack) -> Texture2D:
	if _stack.item.texture_layers:
		print('Item has texture layers ', _stack.item.name)
		var texture = DrawableTexture2D.new()
		texture.setup(
			256,
			256,
			DrawableTexture2D.DRAWABLE_FORMAT_RGBA8,
			Color(0,0,0,0),
			false
		)
		for layer in _stack.item.texture_layers:
			print('	layers: ', layer.name)
			# GODOT BUG: layer.texture can't be used directly in texture.blit_rect
			var new_texture: ImageTexture = ImageTexture.create_from_image(
				layer.texture.get_image()
			)
			var color = Color(1.0, 0.743, 0.3, 1.0) if layer.name == "frosting" else Color(1,1,1,1)
			texture.blit_rect(
				Rect2i(0, 0, 256, 256),
				new_texture,
				color,
			)
		return texture
	else:
		var texture = PlaceholderTexture2D.new()
		texture.size = Vector2(256, 256)
		return texture
