extends PanelContainer

const ITEM_BUTTON = preload("res://ui/item_button.tscn")
const FURNI_BUTTON = preload("res://ui/furni_button.tscn")

signal purchase_item(item: ItemInfo)
signal purchase_furni(furni: FurniInfo)

func _ready() -> void:
	for name in Global.registry.items:
		var info: ItemInfo = Global.registry.items[name]
		if info.cost_tier != 0:
			var button: ItemButton = ITEM_BUTTON.instantiate()
			button.item = info
			button.pressed.connect(purchase_item.emit.bind(info))
			%Items.add_child(button)
	for name in Global.registry.furnis:
		var info: FurniInfo = Global.registry.furnis[name]
		if info.cost:
			var button: FurniButton = FURNI_BUTTON.instantiate()
			button.furni = info
			button.pressed.connect(purchase_furni.emit.bind(info))
			%Furniture.add_child(button)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass
