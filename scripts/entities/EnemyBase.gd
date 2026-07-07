extends Node2D
class_name EnemyBase

signal enemy_died(reward: int)
signal enemy_reached_end(heart_cost: int)

@export var config: EnemyConfig

var hp: int = 0

var _max_hp: int = 1
var _path_follow: PathFollow2D
var _is_dead: bool = false
var _game_over: bool = false

var _poison_damage_per_tick: int = 0
var _poison_tick_interval: float = 1.0
var _poison_timer: float = 0.0
var _poison_ticks_remaining: int = 0

var _current_speed: float = 0.0

# Manche Typen (z.B. DschungelSpaeher) nutzen einen AnimatedSprite2D statt
# eines einzelnen "Sprite2D"-Kindknotens - deshalb get_node_or_null statt
# $Sprite2D, damit das dort nicht crasht.
@onready var _sprite: Sprite2D = get_node_or_null("Sprite2D") as Sprite2D

func _ready() -> void:
	add_to_group("enemies")
	_path_follow = get_parent() as PathFollow2D
	GameState.game_over.connect(_on_game_over)
	if config == null:
		push_warning("EnemyBase '%s': kein EnemyConfig zugewiesen" % name)
		return
	hp = config.hp
	_max_hp = max(config.hp, 1)
	if _sprite and config.texture:
		_sprite.texture = config.texture

func _physics_process(delta: float) -> void:
	if _is_dead or _game_over or _path_follow == null or config == null:
		return
	_process_poison(delta)
	if _is_dead:
		return
	var effective_speed: float = config.speed
	if config.enrage_hp_threshold > 0.0 and (float(hp) / float(_max_hp)) <= config.enrage_hp_threshold:
		effective_speed *= config.enrage_speed_multiplier
	_current_speed = effective_speed
	_path_follow.progress += effective_speed * delta
	if _path_follow.progress_ratio >= 1.0:
		_is_dead = true
		enemy_reached_end.emit(config.heart_cost)
		_remove_from_path()

func take_damage(amount: int) -> void:
	if _is_dead:
		return
	hp -= amount
	queue_redraw()
	if hp <= 0:
		_die()

func apply_poison(damage_per_tick: int, tick_interval: float, duration: float) -> void:
	if tick_interval <= 0.0:
		return
	_poison_damage_per_tick = damage_per_tick
	_poison_tick_interval = tick_interval
	_poison_ticks_remaining = int(round(duration / tick_interval))
	_poison_timer = 0.0

func _process_poison(delta: float) -> void:
	if _poison_ticks_remaining <= 0:
		return
	_poison_timer += delta
	while _poison_timer >= _poison_tick_interval and _poison_ticks_remaining > 0:
		_poison_timer -= _poison_tick_interval
		_poison_ticks_remaining -= 1
		take_damage(_poison_damage_per_tick)
		if _is_dead:
			return

func get_path_progress() -> float:
	return _path_follow.progress_ratio if _path_follow else 0.0

func get_current_speed() -> float:
	return _current_speed

func _die() -> void:
	_is_dead = true
	enemy_died.emit(config.reward)
	_remove_from_path()

func _remove_from_path() -> void:
	if _path_follow:
		_path_follow.queue_free()
	else:
		queue_free()

func _on_game_over() -> void:
	_game_over = true

## Schmaler Lebensbalken ueber dem Kopf, nur sichtbar bei Schaden.
func _draw() -> void:
	if config == null or _is_dead or hp <= 0 or hp >= _max_hp:
		return
	var bar_width := 40.0
	var bar_height := 5.0
	var top_left := Vector2(-bar_width / 2.0, -config.health_bar_offset)
	var ratio: float = float(hp) / float(_max_hp)
	draw_rect(Rect2(top_left, Vector2(bar_width, bar_height)), Color(0.6, 0.08, 0.08))
	draw_rect(Rect2(top_left, Vector2(bar_width * ratio, bar_height)), Color(0.15, 0.75, 0.2))
