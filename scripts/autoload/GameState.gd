extends Node

signal hearts_changed(new_amount: int)
signal game_over()

var hearts: int = 20
var max_hearts: int = 20
var is_game_over: bool = false

func reset(starting_hearts: int = -1) -> void:
	if starting_hearts >= 0:
		max_hearts = starting_hearts
	hearts = max_hearts
	is_game_over = false
	hearts_changed.emit(hearts)

func lose_heart(amount: int = 1) -> void:
	if is_game_over:
		return
	hearts = max(hearts - amount, 0)
	hearts_changed.emit(hearts)
	if hearts <= 0:
		is_game_over = true
		game_over.emit()

## Sterne-Bewertung nach GDD 4.5: 3 = keine Herzen verloren, 2 = >= 50% uebrig, 1 = < 50%
func get_star_rating() -> int:
	if max_hearts <= 0:
		return 0
	if hearts >= max_hearts:
		return 3
	if float(hearts) / float(max_hearts) >= 0.5:
		return 2
	return 1
