@tool
class_name FurniStation
extends FurniCountertop

@export var location: Recipe.Location = Recipe.Location.MIXER

var eventual_result: ItemStack = null
var stored_ingredients: ItemNode = null
var stored_stack: ItemStack = null
@onready var recipe_timer: Timer = $RecipeTimer
@onready var status_indicator: HGStatusIndicator = $StatusIndicator


func _ready() -> void:
	recipe_timer.timeout.connect(_on_recipe_timeout)


func interact(player: Node):
	if not recipe_timer.is_stopped():
		return  # be patient
	if not try_craft():
		# that won't do
		player.indicator.light_color = Color.RED
		var tween := player.create_tween().set_ease(Tween.EASE_OUT)
		tween.tween_property(player.indicator, ^"light_color", player.indicator_color, 0.2)

func try_craft() -> bool:
	if not item:
		return false

	var my_recipes = Global.registry.recipes.values().filter(
			func(r: Recipe): return r.location == location
	)
	for recipe in my_recipes:
		var info = recipe.matches(Array([item.stack], TYPE_OBJECT, "Resource", ItemStack))
		print("try recipe: ", recipe, " result: ", info)
		if info.success:
			# TODO: wait for this result and show progress
			var stack: ItemStack = recipe.output.duplicate(true)\
					.as_combination(info.modifiers + info.ingredients)
			stack.modifiers = info.modifiers
			stack.craft_depth = info.craft_depth
			stack.unique_modifier_depth = info.unique_modifier_depth
			stack.total_modifier_depth = info.total_modifier_depth
			if info.container:
				var container_stack: ItemStack = info.container.duplicate(true)
				container_stack.contents = [stack]
				stack = container_stack
			print("success: will make ", stack)
			eventual_result = stack
			stored_ingredients = item
			stored_stack = item.stack
			stored_stack.changed.connect(cancel_craft, CONNECT_ONE_SHOT)
			recipe_timer.start(recipe.time)
			status_indicator.start()
			return true
	return false


func _process(_delta: float) -> void:
	if not recipe_timer.is_stopped():
		if item != stored_ingredients:
			cancel_craft()
		status_indicator.set_progress(
				1.0 - recipe_timer.time_left / max(0.001, recipe_timer.wait_time)
		)


func cancel_craft():
	# We connect to .changed with ONE_SHOT to be sure we're only notified about
	# stack changes _once_. However, other actions (like taking the ItemNode)
	# can call this, so we can't be sure that the connection removed itself.
	# In that case, we have to avoid leaking the connection ourselves, and do
	# it on the stored stack (in case the ItemNode's stack changed meantime).
	if stored_stack.changed.is_connected(cancel_craft):
		stored_stack.changed.disconnect(cancel_craft)
	recipe_timer.stop()
	status_indicator.stop()

func _on_recipe_timeout():
	stored_stack.changed.disconnect(cancel_craft)
	item = ItemNode.make_node(eventual_result)
	status_indicator.stop()
