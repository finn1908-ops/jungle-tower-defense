extends Node

signal gold_changed(new_amount: int)

@export var default_starting_gold: int = 100

var gold: int = 0

func reset_gold(starting_gold: int = -1) -> void:
	gold = starting_gold if starting_gold >= 0 else default_starting_gold
	gold_changed.emit(gold)

func add_gold(amount: int) -> void:
	gold += amount
	gold_changed.emit(gold)

func spend_gold(amount: int) -> bool:
	if amount > gold:
		return false
	gold -= amount
	gold_changed.emit(gold)
	return true
