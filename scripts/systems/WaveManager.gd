extends Node
class_name WaveManager

signal wave_started(wave_number: int)
signal wave_completed(wave_number: int)
signal all_waves_completed()
signal level_completed()

@export var level_waves: LevelWaves
@export var enemy_path_node: NodePath

var enemy_path: Path2D
var _game_over: bool = false
var _current_wave_index: int = 0
var _wave_running: bool = false
var _all_waves_spawned: bool = false
var _level_completed: bool = false
var _alive_enemies: int = 0

const _SPAWN_DELAY_JITTER := 0.2

func _ready() -> void:
	enemy_path = get_node_or_null(enemy_path_node) as Path2D
	GameState.game_over.connect(_on_game_over)

## Wird vom HUD-"Welle starten"-Button ausgeloest. Laeuft nur eine Welle,
## danach pausiert der WaveManager wieder bis zum naechsten Aufruf.
func start_next_wave() -> void:
	if _wave_running or _game_over or _all_waves_spawned:
		return
	if level_waves == null or enemy_path == null:
		push_warning("WaveManager: level_waves oder enemy_path nicht gesetzt")
		return
	_wave_running = true
	_run_wave(_current_wave_index)

func _run_wave(index: int) -> void:
	var wave: WaveData = level_waves.waves[index]
	wave_started.emit(index + 1)
	for raw_entry in wave.entries:
		if _game_over:
			return
		var entry: WaveEntry = raw_entry
		for n in entry.count:
			if _game_over:
				return
			_spawn_enemy(entry.enemy_scene)
			var effective_delay: float = max(0.0, entry.delay + randf_range(-_SPAWN_DELAY_JITTER, _SPAWN_DELAY_JITTER))
			await get_tree().create_timer(effective_delay).timeout
	if _game_over:
		return
	_current_wave_index += 1
	_wave_running = false
	wave_completed.emit(index + 1)
	if _current_wave_index >= level_waves.waves.size():
		_all_waves_spawned = true
		all_waves_completed.emit()
		_check_level_completed()

func _spawn_enemy(enemy_scene: PackedScene) -> void:
	if enemy_scene == null or enemy_path == null:
		return
	var path_follow := PathFollow2D.new()
	path_follow.rotates = false
	path_follow.loop = false
	path_follow.progress = 0.0
	enemy_path.add_child(path_follow)
	var enemy: EnemyBase = enemy_scene.instantiate()
	enemy.enemy_died.connect(_on_enemy_died)
	enemy.enemy_reached_end.connect(_on_enemy_reached_end)
	path_follow.add_child(enemy)
	_alive_enemies += 1

func _on_enemy_died(reward: int) -> void:
	EconomyManager.add_gold(reward)
	_alive_enemies -= 1
	_check_level_completed()

func _on_enemy_reached_end(heart_cost: int) -> void:
	GameState.lose_heart(heart_cost)
	_alive_enemies -= 1
	_check_level_completed()

func _check_level_completed() -> void:
	if _level_completed or _game_over:
		return
	if _all_waves_spawned and _alive_enemies <= 0:
		_level_completed = true
		level_completed.emit()

func _on_game_over() -> void:
	_game_over = true
