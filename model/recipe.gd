class_name Recipe
extends Resource

enum Location {
	CUTTING_BOARD,
	MIXER,
	SAUCEPAN,
	OVEN,
	PIPING_STATION,
}

## A readable name for this recipe. Not significant to gameplay.
@export var name: String = ""
## What this recipe results in. item and size are used as-is; combined_attributes
## are merged, and modifiers are appended to.
@export var output: ItemStack
## The furniture in which this recipe is valid.
@export var location: Location = Location.CUTTING_BOARD
## The container required for this recipe, if non-empty. May name a kind of item
## (through the name field) or be a group name.
@export var container: String = ""
## Names (or groups) of kinds of items required for this recipe. Multiplicity is
## allowed; as many of each kind are required as matching entries in this list.
@export var ingredients: PackedStringArray = PackedStringArray()
## Names (or groups) of kinds of items optionally allowed for this recipe.
## Multiplicity is not recommended--one can always add as many of these kinds
## of items as desired.
@export var permitted_modifiers: PackedStringArray = PackedStringArray()
## How long this recipe takes, in seconds.
@export var time: float = 1.0

static func from_json(d: Dictionary, lookup_item: Callable) -> Recipe:
	var rec = Recipe.new()
	rec.name = d.get("human_name", "")
	rec.time = float(d.get("time", 0.0))
	rec.output = ItemStack.new(lookup_item.call(d.get("output")), d.get("quantity", 1))
	var pan = d.get("pan")
	if pan and pan != "NONE":
		rec.container = pan
	rec.location = Location[d.get("location", "CUTTING_BOARD")]
	for ingr in d.get("ingredients", []):
		rec.ingredients.append(ingr)
	for mod in d.get("allowedModifiers", []):
		rec.permitted_modifiers.append(mod)
	return rec


func _to_string() -> String:
	return "Recipe:" + name


static func _gcd(a: int, b: int) -> int:
	while b != 0:
		var new_a := b
		var new_b := a % b
		a = new_a
		b = new_b
	return a


## Given an array of [ItemStack]s, can this recipe be done? Returns a Dictionary
## with the following fields:[br]
##
## - success: bool: Will it work? If not, all other fields are omitted.[br]
## - multiplicity: int: The amount of copies this recipe is set up to result in.
##   This should be used to scale the [member output] (see [method ItemStack.multiply]) and
##   also any other resources (such as [member time]).[br]
## - modifiers: Array[lb][ItemStack][rb]: [member ItemStack.modifiers] for the
##   resulting recipe. These should be set on a _duplicate_ of the [member output]
##   as they will differ between successful completions.[br]
## - finishers: Array[lb][ItemStack][rb]: [member ItemStack.finishers], similarly.[br]
## - craft_depth: int: [member ItemStack.craft_depth], similarly.[br]
## - unique_modifier_depth: int: [member ItemStack.unique_modifier_depth], similarly.[br]
## - total_modifier_depth: int: [member ItemStack.total_modifier_depth], similarly.[br]
## - container: [ItemStack]: If not [code]null[/code], the result should be put
##   as the sole [member ItemStack.contents] in (a duplicate of) this stack.[br]
## - ingredients: Array[lb][ItemStack][rb]: The non-modifier, non-finisher [param inputs]
##   that were used, reduced by a factor of multiplicity. This is mostly useful
##   for debugging.[br]
##
## This algorithm is _not_ fast; since there can be overlap between ingredients
## and modifiers/finishers, this algorithm tries all permutations of inputs that
## match each slot, making its performance approximately O(r^i) for r recipe slots
## and i ingredients. (This is EXPTIME, and this is bad.) Cache results when
## you can.
func matches(inputs: Array[ItemStack], _container: ItemStack = null) -> Dictionary:
	if not inputs:
		return {success = false}
	if inputs.size() == 1 and inputs[0].item.is_category(ItemInfo.Category.CONTAINER):
		return matches(inputs[0].contents, inputs[0])

	if container and not (
		_container
		and _container.item.matches_spec(container)
	):
		return {success = false}

	var cardinalities: Dictionary[ItemStack, int] = {}
	for stack in inputs:
		var found := false
		for compare in cardinalities:
			if compare.is_stackable(stack):
				cardinalities[compare] += 1
				found = true
				break
		if not found:
			cardinalities[stack] = 1

	var cvs := cardinalities.values()
	var gcd: int = cvs[0]
	for i in range(1, len(cvs)):
		gcd = _gcd(gcd, cvs[i])

	var multiplicity := gcd
	var dedup_inputs: Array[ItemStack] = []
	for stk in cardinalities:
		var card := cardinalities[stk] / multiplicity
		for _i in range(card):
			dedup_inputs.append(stk)

	print(self, ": considering inputs ", dedup_inputs, ' * ', multiplicity)
	var permitted_ingredients = []
	for ingr in ingredients:
		var valid: Array = []
		for index in range(len(dedup_inputs)):
			var stack: ItemStack = dedup_inputs[index]
			if stack.item.matches_spec(ingr):
				valid.append({index = index, stack = stack})
		if not valid:
			print(self, ": could not find a match for ingr ", ingr)
			return {success = false}
		permitted_ingredients.append(valid)

	var new_depth: int = 1
	match inputs.size():
		0:
			pass
		1:
			new_depth = inputs[0].craft_depth + 1
		2:
			var res = max.callv(inputs.map(
					func(s: ItemStack): return s.craft_depth
			))
			print('max(', inputs, ') = ', res)
			new_depth = res + 1

	var indices: Array[int] = Array(
		permitted_ingredients.map(func(_ignored): return 0),
		TYPE_INT, &"", null,
	)
	while true:
		var remaining := dedup_inputs.duplicate()
		var to_remove: Array[int] = []
		var impossible := false

		for meta_index in range(len(indices)):
			if permitted_ingredients[meta_index][indices[meta_index]].index in to_remove:
				impossible = true
				break
			to_remove.append(permitted_ingredients[meta_index][indices[meta_index]].index)

		if not impossible:
			to_remove.sort()
			to_remove.reverse()
			var used_ingredients: Array[ItemStack] = []
			for index in to_remove:
				used_ingredients.append(remaining[index])
				remaining.remove_at(index)

			for stack in remaining:
				var found := false
				for kind in permitted_modifiers:
					if stack.item.matches_spec(kind):
						found = true
						break
				if not found:
					impossible = true
					break

			if not impossible:
				var uniq_mod_depth := 0
				var total_mod_depth := 0
				for stack in used_ingredients:
					uniq_mod_depth += stack.unique_modifier_depth
					total_mod_depth += stack.total_modifier_depth
				uniq_mod_depth += ItemStack.get_stacks_cardinality(remaining).size()
				total_mod_depth += remaining.size()
				var new_modifiers: Array[ItemStack] = []
				for inp in dedup_inputs:
					new_modifiers.append_array(inp.modifiers)
				new_modifiers.append_array(remaining)
				var new_finishers: Array[ItemStack] = []
				for inp in dedup_inputs:
					new_finishers.append_array(inp.finishers)
				return {
					success = true,
					multiplicity = multiplicity,
					modifiers = new_modifiers,
					finishers = new_finishers,
					ingredients = used_ingredients,
					container = _container,
					craft_depth = new_depth,
					unique_modifier_depth = uniq_mod_depth,
					total_modifier_depth = total_mod_depth,
				}

		var can_continue := false
		for meta_index in range(len(indices)):
			indices[meta_index] += 1
			if indices[meta_index] >= permitted_ingredients[meta_index].size():
				indices[meta_index] = 0
			else:
				can_continue = true
				break

		if not can_continue:
			break

	return {success = false}
