@abstract
extends Node3D
class_name FurniNode

## Return true if the given item can be placed on/in this furniture.
@abstract
func item_can_fit(other_item: ItemNode) -> bool;

## Called when you have been placed on a tile.
@abstract
func unpack();

## Called when you are taken away from a tile, back into someone's hand.
@abstract
func pack();
