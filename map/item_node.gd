@tool
extends BaseMapNode
class_name ItemNode

enum FlavoringSpriteOffset {
	CHERRY,
	RASPBERRY,
	STRAWBERRY,
	ORANGE,
	ALMOND,
	CARAMEL,
	LEMON,
	LIME,
	MINT,
	BLUEBERRY,
	UBE,
	GRAPE,
	CHOCOLATE,
	PLAIN,
	WHIPPED_CREAM,
}


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
			if (
				layer.name == "tintable"
				and _stack.modifiers
				and _stack.modifiers.size() > 0
			):
				draw_layer_into_texture(texture, layer.texture)
				for modifier in _stack.modifiers:
					#print('		modifier: ', modifier.item.name, ' count: ', modifier.count)
					for pass_index in modifier.count:
						var modifier_texture = modifier.item.texture
						draw_layer_into_texture(
							texture,
							modifier_texture,
							BlitMaterial.BlendMode.BLEND_MODE_MUL
						)
			elif (
				layer.name == "label"
				and _stack.modifiers
				and _stack.modifiers.size() > 0
			):
				var label: String = ""
				for modifier in _stack.modifiers:
					label += modifier.item.name.replace('_flavoring', '').to_upper()
				var labelIndex = FlavoringSpriteOffset.keys().find(label)
				# note to Admiral: Rect2i and other simple types are pass by value, not reference
				var region_orig = layer.texture.region as Rect2i
				var region = layer.texture.region as Rect2i
				print('	label: ', label, '\n	labelIndex: ', labelIndex)
				if labelIndex != -1:
					region.position.x = 256 * labelIndex
				print('	region: ', layer.texture.region)
				layer.texture.region = region
				draw_layer_into_texture(texture, layer.texture)
				layer.texture.region = region_orig
			else:
				draw_layer_into_texture(texture, layer.texture)
		return texture
	else:
		var texture = PlaceholderTexture2D.new()
		texture.size = Vector2(256, 256)
		return texture

static func draw_layer_into_texture(
	destination: DrawableTexture2D,
	source: Texture2D,
	blend_mode: BlitMaterial.BlendMode = BlitMaterial.BlendMode.BLEND_MODE_MIX,
):
	# GODOT BUG: Texture2D can't be used directly in DrawableTexture2D.blit_rect
	var source_image = source.get_image()
	# if you get errors calling source.get_image(), click on the image in fs
	# view, then look at the "import" tab ABOVE the FileSystem tab and change
	# mode to "Lossless" and then click "Reimport" at the bottom of the import panel
	var new_texture: ImageTexture = ImageTexture.create_from_image(source_image)
	# end bug handling
	var material = BlitMaterial.new()
	material.blend_mode = blend_mode
	destination.blit_rect(
		Rect2i(0, 0, 256, 256),
		new_texture,
		Color(1,1,1,1),
		0,
		material,
	)
