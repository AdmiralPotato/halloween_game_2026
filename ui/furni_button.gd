class_name FurniButton
extends Button

@export var furni: FurniInfo:
	set(info):
		furni = info
		if furni:
			text = furni.name
