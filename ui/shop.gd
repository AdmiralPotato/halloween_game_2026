extends PanelContainer

const ITEM_BUTTON = preload("res://ui/item_button.tscn")
const FURNI_BUTTON = preload("res://ui/furni_button.tscn")

signal purchase_item(item: ItemInfo)
signal purchase_furni(furni: FurniInfo)

func _ready() -> void:
	for info in Global.registry.get_items_by_sort():
		if info.cost_tier != 0:
			var button: ItemButton = ITEM_BUTTON.instantiate()
			button.item = info
			button.pressed.connect(purchase_item.emit.bind(info))
			%Items.add_child(button)
	for furni in Global.registry.furnis:
		var info: FurniInfo = Global.registry.furnis[furni]
		if info.cost:
			var button: FurniButton = FURNI_BUTTON.instantiate()
			button.furni = info
			button.pressed.connect(purchase_furni.emit.bind(info))
			%Furniture.add_child(button)
