extends Node

signal hearts_changed(new_amount: int)
signal game_over()

var hearts: int = 20
var is_game_over: bool = false

func lose_heart(amount: int = 1) -> void:
	if is_game_over:
		return
	hearts = max(hearts - amount, 0)
	hearts_changed.emit(hearts)
	if hearts <= 0:
		is_game_over = true
		game_over.emit()
