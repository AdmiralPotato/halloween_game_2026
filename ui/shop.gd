class_name Shop
extends PanelContainer

const ITEM_BUTTON = preload("res://ui/item_button.tscn")
const FURNI_BUTTON = preload("res://ui/furni_button.tscn")

signal purchase_item(item: ItemInfo)
signal purchase_furni(furni: FurniInfo)

var last_focused;

func _ready() -> void:
	Global.shop_ui = self
	for info in Global.registry.get_items_by_sort(ItemInfo.Category.SHOP):
		if info.cost_tier != 0:
			var button: ItemButton = ITEM_BUTTON.instantiate()
			button.item = info
			var on_focus := focus_item.bind(info)
			button.focus_entered.connect(on_focus)
			button.pressed.connect(on_focus)
			%Items.add_child(button)
	for furni in Global.registry.furnis:
		var info: FurniInfo = Global.registry.furnis[furni]
		if info.cost:
			var button: FurniButton = FURNI_BUTTON.instantiate()
			button.furni = info
			var on_focus := focus_furni.bind(info)
			button.focus_entered.connect(on_focus)
			button.pressed.connect(on_focus)
			%Furniture.add_child(button)


func focus_item (item: ItemInfo) -> void:
	print('Shop: Item focused', item)
	last_focused = item
	var category_values = ItemInfo.Category.keys();
	var categories: Array[String] = []
	for i in item.categories:
		categories.append(str(category_values[i]).to_lower())
	%DescriptionText.text = str(
		'Name: ', item.display_name,
		'\nPrice: ', item.actual_cost,
		'\nCategories: ', ", ".join(categories),
	)


func focus_furni (furni: FurniInfo) -> void:
	print('Shop: Furni focused', furni)
	last_focused = furni
	%DescriptionText.text = str(
		'Name: ', furni.name,
		'\nPrice: ', furni.cost,
	)


func open () -> void:
	visible = true
	var first_shop_item = %Items.get_child(0)
	first_shop_item.grab_focus()


func close () -> void:
	visible = false
	%ScrollContainer.scroll_vertical = 0


func _unhandled_input(event: InputEvent) -> void:
	if !visible:
		return
	if (
		event.is_action_pressed("pickup")
		or event.is_action_pressed("ui_accept")
	):
		if last_focused is ItemInfo:
			get_viewport().set_input_as_handled()
			purchase_item.emit(last_focused)
		if last_focused is FurniInfo:
			get_viewport().set_input_as_handled()
			purchase_furni.emit(last_focused)
