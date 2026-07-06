extends Node2D
class_name TowerBase

@export var config: TowerConfig

@onready var _fire_timer: Timer = $FireTimer
@onready var _detection_shape: CollisionShape2D = $DetectionArea/CollisionShape2D
@onready var _sprite: Sprite2D = $Sprite2D

var _current_target: EnemyBase = null

func _ready() -> void:
	if config == null:
		push_warning("TowerBase '%s': kein TowerConfig zugewiesen" % name)
		return
	if _sprite and config.texture:
		_sprite.texture = config.texture
	if _detection_shape.shape is CircleShape2D:
		var shape: CircleShape2D = _detection_shape.shape.duplicate()
		shape.radius = config.range
		_detection_shape.shape = shape
	_fire_timer.wait_time = config.fire_rate
	_fire_timer.timeout.connect(_on_fire_timer_timeout)
	_fire_timer.start()
	GameState.game_over.connect(_on_game_over)

func _on_fire_timer_timeout() -> void:
	if config.is_aoe:
		_fire_aoe()
	else:
		_fire_single()

func _fire_single() -> void:
	var target := _find_target()
	if target:
		_apply_hit(target)

func _fire_aoe() -> void:
	for enemy in get_tree().get_nodes_in_group("enemies"):
		if not is_instance_valid(enemy):
			continue
		if global_position.distance_to(enemy.global_position) <= config.range:
			_apply_hit(enemy)

func _apply_hit(enemy: EnemyBase) -> void:
	enemy.take_damage(config.damage)
	if config.dot_duration > 0.0:
		enemy.apply_poison(config.dot_damage_per_tick, config.dot_tick_interval, config.dot_duration)

func _find_target() -> EnemyBase:
	if is_instance_valid(_current_target):
		if global_position.distance_to(_current_target.global_position) <= config.range:
			return _current_target
		_current_target = null
	var best: EnemyBase = null
	var best_progress: float = -1.0
	for enemy in get_tree().get_nodes_in_group("enemies"):
		if not is_instance_valid(enemy):
			continue
		var distance: float = global_position.distance_to(enemy.global_position)
		if distance > config.range:
			continue
		var progress: float = enemy.get_path_progress()
		if progress > best_progress:
			best = enemy
			best_progress = progress
	_current_target = best
	return best

func _on_game_over() -> void:
	_fire_timer.stop()
