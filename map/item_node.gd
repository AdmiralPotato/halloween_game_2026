@abstract
extends Node3D
class_name ItemNode

## If the given item can be combined with this item, do it, and return true.
## Otherwise, return false;
@abstract
func attempt_combine(other_item: ItemNode) -> bool;
