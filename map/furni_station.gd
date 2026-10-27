@tool
class_name FurniStation
extends FurniCountertop

@export var location: Recipe.Location = Recipe.Location.MIXER

var eventual_result: ItemStack = null
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
			recipe_timer.start(recipe.time)
			status_indicator.start()
			return true
	return false


func _process(_delta: float) -> void:
	if not recipe_timer.is_stopped():
		status_indicator.set_progress(
				1.0 - recipe_timer.time_left / max(0.001, recipe_timer.wait_time)
		)


func _on_recipe_timeout():
	item = ItemNode.make_node(eventual_result)
	status_indicator.stop()
