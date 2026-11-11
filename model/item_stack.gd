@tool
class_name ItemStack
extends Resource

## The kind of item in this stack. (NOTE: Setting this will reset the combined
## modifiers, but only for those modifers on the item. Generally, don't do this
## after forming the item stack; the only reason this occurs is to support the
## editor and Resource deserialization, which invokes the nilary constructor and
## then this setter.)
@export var item: ItemInfo:
	set(new):
		item = new
		if item:
			for attr in item.attributes:
				combined_attributes[attr] = item.attributes[attr]
		emit_changed()
## How many items are in this stack.
@export_range(0, 50, 1, "or_greater") var count: int = 1:
	set(new):
		count = new
		emit_changed()
## The sum of all attributes vectors for items that contributed to this stack,
## either in base or through Recipes. Note that, in a stack with multiple items,
## each single item has these attributes, to keep merging and splitting simple.
## See .total_attributes for the sum.
@export var combined_attributes: Dictionary[ItemInfo.Attribute, int] = {}:
	set(new):
		combined_attributes = new
		emit_changed()
## Modifiers (extra ingredients optional in some Recipes).
@export var modifiers: Array[ItemStack] = []:
	set(new):
		modifiers = new
		emit_changed()
## Finishers (Toppings that can only be applied after the item is baked).
@export var finishers: Array[ItemStack] = []:
	set(new):
		finishers = new
		emit_changed()
## A stack of items inside this stack (relevant for CONTAINER items).
@export var contents: Array[ItemStack] = []:
	set(new):
		contents = new
		emit_changed()
## How many recipes/changes this stack has gone through. Determines the cost
## of resulting products.
@export var craft_depth: int = 0:
	set(new):
		craft_depth = new
		emit_changed()
## How many unique modifiers this stack has had in the course of its processing.
## Determines the cost of resulting products.
@export var unique_modifier_depth: int = 0:
	set(new):
		unique_modifier_depth = new
		emit_changed()
## How many total modifiers this stack has had in the course of its processing.
## Determines the cost of resulting products.
@export var total_modifier_depth: int = 0:
	set(new):
		total_modifier_depth = new
		emit_changed()

var total_attributes: Dictionary[ItemInfo.Attribute, int]:
	get:
		var attrs: Dictionary[ItemInfo.Attribute, int] = {}
		for attr in combined_attributes:
			attrs[attr] = combined_attributes[attr] * count
		return attrs

static func get_stacks_cardinality(mods: Array[ItemStack]) -> Dictionary[ItemInfo, int]:
	# XXX we can't always assume that the same named ItemInfo is the same
	# ItemInfo object because we have to deep-clone in many cases (e.g. the
	# contents property), so we use another likely-static property instead.
	var card: Dictionary[String, int] = {}
	var info: Dictionary[String, ItemInfo] = {}
	for mod in mods:
		if mod.item:
			if mod.item.name not in info:
				info[mod.item.name] = mod.item
			card[mod.item.name] = card.get(mod.item.name, 0) + mod.count
	var ret: Dictionary[ItemInfo, int] = {}
	for mod_name in card:
		ret[info[mod_name]] = card[mod_name]
	return ret

var modifier_cardinality: Dictionary[ItemInfo, int]:
	get:
		return get_stacks_cardinality(modifiers + finishers)

var sell_price: int:
	get:
		if not item:
			return 0
		var my_modifier_cardinality := modifier_cardinality
		var my_unique_modifier_depth: int = my_modifier_cardinality.size()
		var my_total_modifier_depth: int = 0
		for key in my_modifier_cardinality:
			my_total_modifier_depth += my_modifier_cardinality[key]
		var entire_unique_modifier_depth := \
				unique_modifier_depth + my_unique_modifier_depth
		var entire_total_modifier_depth := \
				total_modifier_depth + my_total_modifier_depth
		var my_price := int(ceil(item.sell_price * \
				ItemInfo.PER_CRAFT_BASE ** craft_depth * \
				ItemInfo.PER_UNIQUE_MOD_BASE ** entire_unique_modifier_depth * \
				ItemInfo.PER_EACH_MOD_BASE ** entire_total_modifier_depth
		)) * count
		for stack in contents:
			my_price += stack.sell_price
		return my_price

# We need to keep the nilary form of this constructor around to satisfy the
# ResourceLoader; in that case, it's okay if item is null
func _init(_item: ItemInfo = null, _count: int = 1):
	self.item = _item
	self.count = _count

func get_save_state() -> Dictionary:
	var save: Dictionary = {
		item = item.resource_path,
		count = count,
		craft_depth = craft_depth,
		unique_modifier_depth = unique_modifier_depth,
		total_modifier_depth = total_modifier_depth,
		combined_attributes = {},
		modifiers = [],
		finishers = [],
		contents = [],
	}
	for attr in combined_attributes:
		save.combined_attributes[str(attr)] = combined_attributes[attr]
	for stack in modifiers:
		save.modifiers.append(stack.get_save_state())
	for stack in finishers:
		save.finishers.append(stack.get_save_state())
	for stack in contents:
		save.contents.append(stack.get_save_state())
	return save

func set_save_state(save: Dictionary):
	item = load(save.item)
	count = int(save.count)
	craft_depth = int(save.craft_depth)
	unique_modifier_depth = int(save.unique_modifier_depth)
	total_modifier_depth = int(save.total_modifier_depth)
	combined_attributes.clear()
	modifiers.clear()
	contents.clear()
	for attr in save.combined_attributes:
		combined_attributes[int(attr)] = int(save.combined_attributes[attr])
	for stack_save in save.modifiers:
		modifiers.append(ItemStack.from_save_state(stack_save))
	for stack_save in save.finishers:
		finishers.append(ItemStack.from_save_state(stack_save))
	for stack_save in save.contents:
		contents.append(ItemStack.from_save_state(stack_save))

static func from_save_state(save: Dictionary) -> ItemStack:
	var stack := ItemStack.new()
	stack.set_save_state(save)
	return stack


const VOWELS := "aeiou"
const CARDINALITY: Dictionary[int, String] = {
	2: "extra ",
	3: "triple ",
	4: "quadruple ",
	5: "a lot of ",
	6: "excessive amounts of ",
	7: "too many ",
	8: "almost nothing but ",
	9: "terrifyingly many ",
	10: "m-m-m-monster ",
}
const MAX_CARDINALITY := 10
static func make_list(items: PackedStringArray) -> String:
	match items.size():
		0:
			return ""
		1:
			return items[0]
		2:
			return items[0] + " and " + items[1]
		_:
			var copy := items.duplicate()
			copy[-1] = "and " + copy[-1]
			return ", ".join(copy)

static func pluralize(s: String) -> String:
	return s + ("s" if not s.ends_with("s") else "")
func _to_string() -> String:
	var disp_name := item.display_name if item else "invalid item"
	if count != 1:
		disp_name = pluralize(disp_name)
	var mods := PackedStringArray()
	var card := modifier_cardinality
	for info in card:
		mods.append(
				CARDINALITY.get(min(card[info], MAX_CARDINALITY), "") + \
				info.display_name
		)
	var mod_string := ""
	if mods.size() >= 1:
		mod_string = " with " + make_list(mods)
	var cont_string := ""
	if contents.size() >= 1:
		var contents_str := PackedStringArray()
		for child in contents:
			contents_str.append(str(child))
		cont_string = " of " + make_list(contents_str)
	return '{article} {name}{mods}{contents}'.format({
		article = "no" if count == 0 else \
				("an" if disp_name[0] in VOWELS else "a") if count == 1 else \
				str(count),
		name = disp_name,
		mods = mod_string,
		contents = cont_string,
	})


static func _cardinality_equal(
		a: Dictionary[ItemInfo, int],
		b: Dictionary[ItemInfo, int]
) -> bool:
	if a.size() != b.size():
		return false
	for stk in a:
		if stk not in b:
			return false
		if a[stk] != b[stk]:
			return false
	return true


## Can [param other] be stacked on top of self? This considers all the stack attributes
## that might differ, generally returning false if information isn't exactly the
## same. This is a conservative implementation, so some semantically-equal
## stacks might not stack as easily.
##
## Note that this does _NOT_ consider [member ItemInfo.max_stack_size], and accept can
## "fail" to stack something as a result of this; the return value is _NOT_ a
## guarantee that accept will return [code]{rest = null}[/code] (even if [code]{success = true}[/code]).
func is_stackable(other: ItemStack) -> bool:
	if item != other.item:
		return false
	if combined_attributes != other.combined_attributes:
		return false
	var mc := modifier_cardinality
	var omc := other.modifier_cardinality
	if not _cardinality_equal(mc, omc):
		return false
	var fc := get_stacks_cardinality(finishers)
	var ofc := get_stacks_cardinality(other.finishers)
	if not _cardinality_equal(fc, ofc):
		return false
	var cc := get_stacks_cardinality(contents)
	var occ := get_stacks_cardinality(other.contents)
	if not _cardinality_equal(cc, occ):
		return false
	return true


## Try to stack [param add] onto self. Returns a Dictionary with two fields:[br]
##
##  - success: bool: Did the operation succeed or fail?[br]
##  - rest: ItemStack: The remnants of `add`. You can safely assign this back
##    to wherever `add` was sourced.[br]
##
## Success does not imply any of [param add] was consumed, only that it could have been.
## Rest will be null if the whole of [param add] was consumed.
func accept(add: ItemStack) -> Dictionary:
	# Containers can hold anything but other containers
	if item.is_category(ItemInfo.Category.CONTAINER):
		if not add.item.is_category(ItemInfo.Category.CONTAINER):
			contents.append(add)
			emit_changed()  # TODO: automatically cause this when contents mutate
			return {success = true, rest = null}
		return {success = false, rest = add}

	# Products can have DECORATIONs and DOODADs added to their finishers property
	if item.is_category(ItemInfo.Category.PRODUCT):
		if (
			add.item.is_category(ItemInfo.Category.DECORATION)
			or add.item.is_category(ItemInfo.Category.DOODAD)
		):
			finishers.append(add)
			emit_changed()  # TODO: automatically cause this when contents mutate
			return {success = true, rest = null}

	# The following definition of stackable is very conservative, by intent;
	# in general, players won't be crafting by stacking, but by using the
	# Recipe system.
	if not is_stackable(add):
		return {success = false, rest = add}

	# stack em up
	print('pre stack: ', self, ', ', add)
	var old_count := count
	count = min(count + add.count, item.max_stack_size)
	add.count -= count - old_count
	print('post stack: ', self, ', ', add, ', having added ', count - old_count)
	if add.count == 0:
		return {success = true, rest = null}
	return {success = true, rest = add}


## "Split" `amount` items off of this stack into a new one, returning [remaining,
## new]. new will have at most amount items (unless amount is negative, in which
## case it will have no items). remaining may be `null` if the whole stack is
## moved.
func split(amount: int) -> Array[ItemStack]:
	if amount <= 0:
		return [self, null]
	if amount >= count:
		return [null, self]
	count -= amount
	var split_stack = ItemStack.new(item, amount)
	split_stack.combined_attributes = combined_attributes
	split_stack.modifiers = modifiers
	split_stack.finishers = finishers
	# We really don't want to duplicate contents if, somehow, we get a stack of
	# containers with contents, so we have to choose one to recieve those
	# contents. Arbitrarily, choose new.
	split_stack.contents = contents
	contents = []
	return [self, split_stack]


## Produce the combined_attributes of the set of all ItemStacks given as input.
static func combine_attrs(inputs: Array[ItemStack]) -> Dictionary[ItemInfo.Attribute, int]:
	var output: Dictionary[ItemInfo.Attribute, int] = {}
	for stack in inputs:
		for attr in stack.combined_attributes:
			output[attr] = output.get(attr, 0) + stack.combined_attributes[attr]
	return output


## Update combined_attrs as if this stack were produces as the combination of the
## input ItemStacks.
func as_combination(inputs: Array[ItemStack]) -> ItemStack:
	combined_attributes = combine_attrs(inputs)
	return self


## Multiply count by the given integer in place, returning self.
func multiply(factor: int) -> ItemStack:
	count *= factor
	return self
