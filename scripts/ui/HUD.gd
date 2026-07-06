extends CanvasLayer
class_name HUD

@export var wave_manager_path: NodePath

@onready var _gold_label: Label = $GoldLabel
@onready var _hearts_label: Label = $HeartsLabel
@onready var _wave_label: Label = $WaveLabel
@onready var _game_over_label: Label = $GameOverLabel

func _ready() -> void:
	EconomyManager.gold_changed.connect(_on_gold_changed)
	GameState.hearts_changed.connect(_on_hearts_changed)
	GameState.game_over.connect(_on_game_over)
	_on_gold_changed(EconomyManager.gold)
	_on_hearts_changed(GameState.hearts)
	_set_wave_label(0)
	_game_over_label.visible = false
	if wave_manager_path != NodePath():
		var wave_manager := get_node(wave_manager_path)
		wave_manager.wave_started.connect(_on_wave_started)

func _on_game_over() -> void:
	_game_over_label.visible = true

func _on_gold_changed(new_amount: int) -> void:
	_gold_label.text = "Gold: %d" % new_amount

func _on_hearts_changed(new_amount: int) -> void:
	_hearts_label.text = "Herzen: %d" % new_amount

func _on_wave_started(wave_number: int) -> void:
	_set_wave_label(wave_number)

func _set_wave_label(wave_number: int) -> void:
	_wave_label.text = "Welle: %d" % wave_number
