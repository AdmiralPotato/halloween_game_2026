class_name ItemStack
extends Resource

## The kind of item in this stack.
@export var item: ItemInfo:
	set(new):
		if new != item:
			emit_changed()
		item = new
## How many items are in this stack.
@export_range(0, 50, 1, "or_greater") var count: int = 1:
	set(new):
		if new != count:
			emit_changed()
		count = new
## The sum of all attributes vectors for items that contributed to this stack,
## either in base or through Recipes. Note that, in a stack with multiple items,
## each single item has these attributes, to keep merging and splitting simple.
## See .total_attributes for the sum.
@export var combined_attributes: Dictionary[ItemInfo.Attribute, int] = {}
## Modifiers (extra ingredients optional in some Recipes).
@export var modifiers: Array[ItemStack] = []
## A stack of items inside this stack (relevant for CONTAINER items).
@export var contents: Array[ItemStack] = []

var total_attributes: Dictionary[ItemInfo.Attribute, int]:
	get:
		var attrs: Dictionary[ItemInfo.Attribute, int] = {}
		for attr in combined_attributes:
			attrs[attr] = combined_attributes[attr] * count
		return attrs
		
var modifier_cardinality: Dictionary[ItemInfo, int]:
	get:
		var card: Dictionary[ItemInfo, int] = {}
		for mod in modifiers:
			if mod.item:
				card[mod.item] = card.get(mod.item, 0) + mod.count
		return card

# We need to keep the nilary form of this constructor around to satisfy the
# ResourceLoader; in that case, it's okay if item is null
func _init(item: ItemInfo = null, count: int = 1):
	self.item = item
	self.count = count
	if item:
		for attr in item.attributes:
			combined_attributes[attr] = item.attributes[attr]
			
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
const MAX_CARDINAILTY := 10
func _to_string() -> String:
	var disp_name := (item.display_name if item else "invalid item") + \
			("s" if count != 1 else "")
	var mods := PackedStringArray()
	var card := modifier_cardinality
	for info in card:
		var suffix = "s" if not info.display_name.ends_with("s") else ""
		mods.append(CARDINALITY.get(card[info], "") + info.display_name + suffix)
	var mod_string := ""
	match mods.size():
		1:
			mod_string = " with " + mods[0]
		2:
			mod_string = " with " + mods[0] + " and " + mods[1]
		var l when l > 2:
			mods[-1] = "and " + mods[-1]
			mod_string = " with " + ", ".join(mods)
	return '{article} {name}{mods}'.format({
		article = "no" if count == 0 else \
				("an" if disp_name[0] in VOWELS else "a") if count == 1 else \
				str(count),
		name = disp_name,
		mods = mod_string,
	})
		
func accept(add: ItemStack) -> Dictionary:
	# Containers can hold anything but other containers
	if item.is_category(ItemInfo.Category.CONTAINER):
		if not add.item.is_category(ItemInfo.Category.CONTAINER):
			contents.append(add)
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
	var split = ItemStack.new(item, amount)
	split.combined_attributes = combined_attributes
	split.modifiers = modifiers
	# We really don't want to duplicate contents if, somehow, we get a stack of
	# containers with contents, so we have to choose one to recieve those
	# contents. Arbitrarily, choose new.
	split.contents = contents
	contents = []
	return [self, split]
	
		
