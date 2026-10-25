@tool
class_name ItemStack
extends Resource

## The kind of item in this stack.
@export var item: ItemInfo:
	set(new):
		item = new
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

static func get_modifier_cardinality_for_modifiers(mods: Array[ItemStack]) -> Dictionary[ItemInfo, int]:
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
		return get_modifier_cardinality_for_modifiers(modifiers)

var sell_price: int:
	get:
		if not item:
			return 0
		return int(ceil(item.sell_price * \
				ItemInfo.PER_CRAFT_BASE ** craft_depth * \
				ItemInfo.PER_UNIQUE_MOD_BASE ** unique_modifier_depth * \
				ItemInfo.PER_EACH_MOD_BASE ** total_modifier_depth
		)) * count

# We need to keep the nilary form of this constructor around to satisfy the
# ResourceLoader; in that case, it's okay if item is null
func _init(_item: ItemInfo = null, _count: int = 1):
	self.item = _item
	self.count = _count
	if _item:
		for attr in _item.attributes:
			combined_attributes[attr] = _item.attributes[attr]

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

func accept(add: ItemStack) -> Dictionary:
	# Containers can hold anything but other containers
	if item.is_category(ItemInfo.Category.CONTAINER):
		if not add.item.is_category(ItemInfo.Category.CONTAINER):
			contents.append(add)
			emit_changed()  # TODO: automatically cause this when contents mutate
			return {success = true, rest = null}
		return {success = false, rest = add}

	# The following definition of stackable is very conservative, by intent;
	# in general, players won't be crafting by stacking, but by using the
	# Recipe system.
	if add.item != item:
		return {success = false, rest = add}
	if add.combined_attributes != combined_attributes:
		return {success = false, rest = add}
	# We could in theory compare modifiers here, but modifiers are a multiset
	# which we don't have a good data structure for. Again, conservative, but
	# the door is open if someone wants to try.
	if add.modifiers or modifiers:
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
