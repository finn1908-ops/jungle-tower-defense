extends CanvasLayer
class_name HUD

@export var wave_manager_path: NodePath
@export var tower_slots_path: NodePath
@export var starter_tower_scene: PackedScene
@export var starter_tower_config: TowerConfig

@onready var _gold_label: Label = $GoldLabel
@onready var _hearts_label: Label = $HeartsLabel
@onready var _wave_label: Label = $WaveLabel
@onready var _start_wave_button: Button = $StartWaveButton
@onready var _build_menu: Control = $BuildMenu
@onready var _build_info_label: Label = $BuildMenu/BuildInfoLabel
@onready var _build_confirm_button: Button = $BuildMenu/BuildConfirmButton
@onready var _build_cancel_button: Button = $BuildMenu/BuildCancelButton
@onready var _sell_menu: Control = $SellMenu
@onready var _sell_info_label: Label = $SellMenu/SellInfoLabel
@onready var _sell_confirm_button: Button = $SellMenu/SellConfirmButton
@onready var _sell_cancel_button: Button = $SellMenu/SellCancelButton
@onready var _game_over_panel: Control = $GameOverPanel
@onready var _game_over_restart_button: Button = $GameOverPanel/GameOverRestartButton
@onready var _victory_panel: Control = $VictoryPanel
@onready var _stars_label: Label = $VictoryPanel/StarsLabel
@onready var _victory_restart_button: Button = $VictoryPanel/VictoryRestartButton

var _wave_manager: WaveManager
var _pending_slot: TowerSlot = null

func _ready() -> void:
	EconomyManager.gold_changed.connect(_on_gold_changed)
	GameState.hearts_changed.connect(_on_hearts_changed)
	GameState.game_over.connect(_on_game_over)
	_on_gold_changed(EconomyManager.gold)
	_on_hearts_changed(GameState.hearts)
	_set_wave_label(0)
	_game_over_panel.visible = false
	_victory_panel.visible = false
	_build_menu.visible = false
	_sell_menu.visible = false
	if wave_manager_path != NodePath():
		_wave_manager = get_node(wave_manager_path)
		_wave_manager.wave_started.connect(_on_wave_started)
		_wave_manager.wave_completed.connect(_on_wave_completed)
		_wave_manager.all_waves_completed.connect(_on_all_waves_completed)
		_wave_manager.level_completed.connect(_on_level_completed)
	if tower_slots_path != NodePath():
		for slot in get_node(tower_slots_path).get_children():
			if slot is TowerSlot:
				slot.slot_tapped.connect(_on_slot_tapped)
	_start_wave_button.pressed.connect(_on_start_wave_pressed)
	_build_confirm_button.pressed.connect(_on_build_confirm_pressed)
	_build_cancel_button.pressed.connect(_on_build_cancel_pressed)
	_sell_confirm_button.pressed.connect(_on_sell_confirm_pressed)
	_sell_cancel_button.pressed.connect(_on_sell_cancel_pressed)
	_game_over_restart_button.pressed.connect(_on_restart_pressed)
	_victory_restart_button.pressed.connect(_on_restart_pressed)

func _on_game_over() -> void:
	_build_menu.visible = false
	_sell_menu.visible = false
	_game_over_panel.visible = true

func _on_gold_changed(new_amount: int) -> void:
	_gold_label.text = "Gold: %d" % new_amount

func _on_hearts_changed(new_amount: int) -> void:
	_hearts_label.text = "Herzen: %d" % new_amount

func _on_wave_started(wave_number: int) -> void:
	_set_wave_label(wave_number)
	_start_wave_button.visible = false

func _on_wave_completed(_wave_number: int) -> void:
	_start_wave_button.visible = true

func _on_all_waves_completed() -> void:
	_start_wave_button.visible = false

func _on_level_completed() -> void:
	_build_menu.visible = false
	_sell_menu.visible = false
	_stars_label.text = "★".repeat(GameState.get_star_rating()) + "☆".repeat(3 - GameState.get_star_rating())
	_victory_panel.visible = true

func _set_wave_label(wave_number: int) -> void:
	_wave_label.text = "Welle: %d" % wave_number

func _on_start_wave_pressed() -> void:
	if _wave_manager:
		_wave_manager.start_next_wave()

func _on_slot_tapped(slot: TowerSlot) -> void:
	if GameState.is_game_over:
		return
	if slot.is_occupied:
		_show_sell_menu(slot)
	else:
		_show_build_menu(slot)

func _show_build_menu(slot: TowerSlot) -> void:
	_sell_menu.visible = false
	_pending_slot = slot
	_build_info_label.text = "%s (%d Gold)" % [starter_tower_config.display_name, starter_tower_config.cost]
	_build_menu.visible = true

func _show_sell_menu(slot: TowerSlot) -> void:
	_build_menu.visible = false
	_pending_slot = slot
	_sell_info_label.text = "Verkaufen fuer %d Gold" % slot.get_refund_amount()
	_sell_menu.visible = true

func _on_build_confirm_pressed() -> void:
	if _pending_slot == null:
		return
	if EconomyManager.spend_gold(starter_tower_config.cost):
		_pending_slot.place_tower(starter_tower_scene)
		_build_menu.visible = false
		_pending_slot = null
	else:
		_build_info_label.text = "Nicht genug Gold!"

func _on_build_cancel_pressed() -> void:
	_build_menu.visible = false
	_pending_slot = null

func _on_sell_confirm_pressed() -> void:
	if _pending_slot == null:
		return
	EconomyManager.add_gold(_pending_slot.remove_tower())
	_sell_menu.visible = false
	_pending_slot = null

func _on_sell_cancel_pressed() -> void:
	_sell_menu.visible = false
	_pending_slot = null

func _on_restart_pressed() -> void:
	get_tree().reload_current_scene()
