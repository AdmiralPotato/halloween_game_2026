class_name FurniCashRegister
extends FurniNode

const PARTICLE = preload("res://ui/text_particle.tscn")

func spawn_particle(text: String, color: Color):
	var node: TextParticle = PARTICLE.instantiate()
	node.text = text
	node.modulate = color
	$Particle.add_child(node)
