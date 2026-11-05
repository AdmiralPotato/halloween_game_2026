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
## Make a new ItemNode. An ItemNode is the renderer and container for an ItemStack,
## and can be placed in the scene tree. The returned node is not yet in the tree,
## and has default transforms (usually centered on the origin with identity basis).
##
## The ItemStack is deep-copied. Thus, it is safe to hand the ItemNode to other
## users without worry that it will alias and mutate the stack passed as an
## argument. As a FurniNode, if you _want_ to relinquish ownership, it's better
## to take or give the ItemNode and not its underlying stack.
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

static var recipe_render_data: Dictionary

static func _static_init() -> void:
	ItemNode.recipe_render_data.assign(JSON.parse_string(
			FileAccess.get_file_as_string("res://business/items/draw_sprites.json")
	))
	#print('ItemNode.recipe_render_data', ItemNode.recipe_render_data)

func _ready():
	update_stack_rendering()

func get_save_state() -> Dictionary:
	var save := super()
	if stack:
		save.stack = stack.get_save_state()
	return save

func set_save_state(save: Dictionary) -> void:
	super(save)
	if 'stack' in save:
		save.stack = ItemStack.from_save_state(save)

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
			$Sprite.texture = render_recipe(stack.item.name, stack.modifiers)
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
		$Sprite.texture = make_unimplemented_texture()
		$Count.text = '0'
		$Count.visible = true


static func draw_layer_into_texture(
	destination: DrawableTexture2D,
	source: Texture2D,
	blend_mode: BlitMaterial.BlendMode = BlitMaterial.BlendMode.BLEND_MODE_MIX,
	color: Color = Color(1,1,1,1)
):
	var texture = source;
	# GODOT BUG: AtlasTexture can't be used directly in DrawableTexture2D.blit_rect
	if source is AtlasTexture:
		var source_image = source.get_image()
		if not source_image:
			print('draw_layer_into_texture: ERROR! source_image is somehow null???')
		# if you get errors calling source.get_image(), click on the image in fs
		# view, then look at the "import" tab ABOVE the FileSystem tab and change
		# mode to "Lossless" and then click "Reimport" at the bottom of the import panel
		texture = ImageTexture.create_from_image(source_image)
	# end bug handling
	var material = BlitMaterial.new()
	material.blend_mode = blend_mode
	destination.blit_rect(
		Rect2i(0, 0, 256, 256),
		texture,
		color,
		0,
		material,
	)

static func render_simple_item_texture_by_name(recipe_name: String) -> Texture2D:
	if not recipe_name in ItemNode.recipe_render_data:
		print('render_simple_item_texture_by_name: MISSING RENDER DATA FOR: ', recipe_name)
		return make_unimplemented_texture()
	var recipe: Dictionary = ItemNode.recipe_render_data[recipe_name]
	if recipe.keys().size() == 1 and recipe.has('base'):
		return render_recipe_layer(recipe.base.root)
	print('render_simple_item_texture_by_name: render not implemented yet: ', recipe_name)
	return make_unimplemented_texture()

static func render_recipe (recipe_name: String, _modifiers: Array[ItemStack] = []) -> Texture2D:
	print('render_recipe: recipe_name: ', recipe_name)
	if not recipe_name in ItemNode.recipe_render_data:
		print('render_recipe: NO RENDER DATA FOR RECIPE: ', recipe_name)
		return make_unimplemented_texture()
	var recipe: Dictionary = ItemNode.recipe_render_data[recipe_name]
	if recipe.keys().size() == 1 and recipe.has('base'):
		return render_recipe_layer(recipe.base.root, make_empty_texture(), _modifiers)
	match recipe_name:
		'frosting': return render_recipe_frosting(recipe, _modifiers)
		'cake_batter': return render_recipe_cookie_dough(recipe, _modifiers)
		'cake': return render_recipe_cake(recipe, _modifiers)
		'cake_piping': return render_recipe_cake_piping(recipe, _modifiers)
		'cake_frosting': return render_recipe_cake_piping(recipe, _modifiers)
		'cake_slice': return render_recipe_cake(recipe, _modifiers)
		'cake_slice_piping': return render_recipe_cake_piping(recipe, _modifiers)
		'cake_slice_frosting': return render_recipe_cake_piping(recipe, _modifiers)
		'cookie_dough': return render_recipe_cookie_dough(recipe, _modifiers)
		'cookie': return render_recipe_cookie(recipe, _modifiers)
		_:
			print('render_recipe: render not implemented yet: ', recipe_name)
			return make_unimplemented_texture()


static func render_recipe_layer (
	_layer: Dictionary,
	_texture: Texture2D = make_empty_texture(),
	_modifiers: Array[ItemStack] = []
) -> Texture2D:
	var type: String = _layer.type;
	#print('render_recipe_layer type: ', type);
	match type:
		'sprite': return render_recipe_layer_sprite(_layer, _texture)
		'multi': return render_recipe_layer_multi(_layer, _texture)
		'ref': return render_recipe_layer_ref(_layer, _texture, _modifiers)
		_:
			print('render_recipe_layer: Unsupported type: ', type)
			return make_unimplemented_texture()


static func render_recipe_layer_sprite (
	_layer: Dictionary,
	_texture: Texture2D = make_empty_texture(),
) -> Texture2D:
	#print('render_recipe_layer_sprite _layer:', _layer)
	var texture_path = "res://assets/" + _layer.file
	#print('render_recipe_layer_sprite texture_path:', texture_path)
	var sourceTexture = make_atlas_texture_at_path_and_coords(texture_path, _layer.x, _layer.y)
	var blend_mode = get_blend_mode_from_string(_layer.mode)
	var color = (
		Color.WHITE
		if not 'colorize' in _layer else
		_layer.colorize
	)
	draw_layer_into_texture(_texture, sourceTexture, blend_mode, color)
	return _texture


static func get_blend_mode_from_string (mode: String) -> BlitMaterial.BlendMode:
	return (
		BlitMaterial.BlendMode.BLEND_MODE_MUL
		if mode == 'multiply' else
		BlitMaterial.BlendMode.BLEND_MODE_MIX
	)


static func make_empty_texture(color: Color = Color(0,0,0,0)) -> DrawableTexture2D:
	var texture = DrawableTexture2D.new()
	texture.setup(
		256,
		256,
		DrawableTexture2D.DRAWABLE_FORMAT_RGBA8,
		color,
		false
	)
	return texture


static func make_atlas_texture_at_path_and_coords(texture_path: String, x: int, y: int) -> AtlasTexture:
	var file = load(texture_path) as CompressedTexture2D
	var sourceTexture = AtlasTexture.new()
	sourceTexture.region = Rect2i(x * 256, y * 256, 256, 256)
	sourceTexture.atlas = file
	return sourceTexture


static func make_unimplemented_texture() -> PlaceholderTexture2D:
	var texture = PlaceholderTexture2D.new()
	texture.size = Vector2i(256, 256)
	return texture


static func render_recipe_layer_multi (
	_layer: Dictionary,
	_texture: Texture2D = make_empty_texture(),
) -> Texture2D:
	if 'sprites' in _layer:
		for sprite in _layer.sprites:
			#print('render_recipe_layer_multi sprite: ', sprite)
			draw_layer_into_texture(
				_texture,
				render_recipe_layer(sprite),
				get_blend_mode_from_string(sprite.mode),
			)
	return _texture


static func render_recipe_layer_ref (
	_layer: Dictionary,
	_texture: Texture2D = make_empty_texture(),
	_modifiers: Array[ItemStack] = [],
) -> Texture2D:
	if not _layer.value in ItemNode.recipe_render_data:
		print('render_recipe_layer_ref: Invalid recipe:', _layer.value)
		return make_unimplemented_texture()
	print('render_recipe_layer_ref: _modifiers:', _modifiers)
	draw_layer_into_texture(
		_texture,
		render_recipe(_layer.value, _modifiers),
	)
	return _texture


static func render_recipe_stack_modifiers (
	_modifiers: Array[ItemStack],
	_recipe_layer_dict: Dictionary,
	_texture: Texture2D = make_empty_texture(),
):
	#print('render_recipe_stack_modifiers: _stack: ', _stack.item.name, ' _stack.modifiers: ', _stack.modifiers)
	#print('render_recipe_stack_modifiers: _recipe_layer_dict: ', _recipe_layer_dict)
	for modifier in _modifiers:
		var modifier_name = modifier.item.name
		#print('render_recipe_stack_modifiers: modifier: ', modifier_name)
		if modifier_name in _recipe_layer_dict:
			var modifier_layer: Dictionary = _recipe_layer_dict[modifier_name]
			print('render_recipe_stack_modifiers: modifier: ', modifier_name, ': ', modifier_layer, modifier)
			var loops = (modifier.count if modifier.count > 1 else 1)
			for i in loops:
				draw_layer_into_texture(
	 				_texture,
	 				render_recipe_layer(modifier_layer, make_empty_texture(), modifier.modifiers),
	 				(
						get_blend_mode_from_string(modifier_layer.mode)
						if 'mode' in modifier_layer else
						BlitMaterial.BlendMode.BLEND_MODE_MIX
					),
	 			)


static func render_recipe_frosting(_recipe: Dictionary, _modifiers: Array[ItemStack]) -> Texture2D:
	print('render_recipe_frosting: ', _modifiers)
	var texture = (
		render_recipe_layer(_recipe.plain.root)
		if _modifiers.size() == 0 else
		render_recipe_layer(_recipe.base.root)
	)
	var has_chocolate = false
	var label_key = ''
	# Note: This is NOT a good candidate for replacement with render_recipe_stack_modifiers(...)
	# because we need to collect values for `has_chocolate` and `label_key`
	for modifier in _modifiers:
		var flavor_modifier: Dictionary = _recipe.flavoring_modifiers[modifier.item.name]
		if flavor_modifier:
			label_key += modifier.item.name
			if modifier.item.name == 'cocoa_powder':
				has_chocolate = true
			for i in modifier.count:
				draw_layer_into_texture(
					texture,
					render_recipe_layer(flavor_modifier),
					get_blend_mode_from_string(flavor_modifier.mode),
				)
	var jar_layer: Dictionary = (
		_recipe.jar.chocolate_jar
		if has_chocolate else
		_recipe.jar.no_chocolate_jar
	)
	#print('render_recipe_frosting jar_layer: ', jar_layer)
	render_recipe_layer(jar_layer, texture)
	if not label_key or not label_key in _recipe.decals:
		label_key = 'plain'
	var decal_layer: Dictionary = _recipe.decals[label_key]
	render_recipe_layer(decal_layer, texture)
	return texture


static func render_recipe_cookie_dough(_recipe: Dictionary, _modifiers: Array[ItemStack]) -> Texture2D:
	print('render_recipe_cookie_dough: ', _modifiers)
	var texture = render_recipe_layer(_recipe.base.root)
	render_recipe_stack_modifiers(_modifiers, _recipe.flavoring_modifiers, texture)
	render_recipe_stack_modifiers(_modifiers, _recipe.other_modifiers, texture)
	render_recipe_layer(_recipe.other.bowl, texture)
	return texture


static func render_recipe_cookie(_recipe: Dictionary, _modifiers: Array[ItemStack]) -> Texture2D:
	print('render_recipe_cookie: ', _modifiers)
	var texture = render_recipe_layer(_recipe.base.root)
	render_recipe_stack_modifiers(_modifiers, _recipe.flavoring_modifiers, texture)
	render_recipe_stack_modifiers(_modifiers, _recipe.other_modifiers, texture)
	render_recipe_stack_modifiers(_modifiers, _recipe.doodads, texture)
	return texture


static func render_recipe_cake(_recipe: Dictionary, _modifiers: Array[ItemStack]) -> Texture2D:
	print('render_recipe_cake: ', _modifiers)
	var texture = render_recipe_layer(_recipe.base.root)
	render_recipe_stack_modifiers(_modifiers, _recipe.flavoring_modifiers, texture)
	render_recipe_stack_modifiers(_modifiers, _recipe.other_modifiers, texture)
	render_recipe_stack_modifiers(_modifiers, _recipe.decorations, texture)
	var has_piping = false
	for modifier in _modifiers:
		if modifier.item.name in _recipe.piping:
			has_piping = true
			break
	var doodads: Dictionary = (
		_recipe.doodads_with_piping
		if has_piping else
		_recipe.doodads_without_piping
	)
	render_recipe_stack_modifiers(_modifiers, _recipe.piping, texture)
	render_recipe_stack_modifiers(_modifiers, doodads, texture)
	return texture


static func render_recipe_cake_piping(_recipe: Dictionary, _modifiers: Array[ItemStack]) -> Texture2D:
	print('render_recipe_cake_piping: ', _modifiers)
	var texture = render_recipe_layer(_recipe.base.root)
	render_recipe_stack_modifiers(_modifiers, _recipe.flavoring_modifiers, texture)
	return texture
