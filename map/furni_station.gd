@tool
class_name FurniStation
extends FurniCountertop

@export var location: Recipe.Location = Recipe.Location.MIXER

func interact(player: Node):
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
			print("success: made ", stack)
			item = ItemNode.make_node(stack)
			return true
	return false
