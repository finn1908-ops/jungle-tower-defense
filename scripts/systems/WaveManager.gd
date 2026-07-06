extends Node
class_name WaveManager

signal wave_started(wave_number: int)
signal all_waves_completed()

@export var level_waves: LevelWaves
@export var enemy_path_node: NodePath

var enemy_path: Path2D
var _game_over: bool = false

func _ready() -> void:
	enemy_path = get_node_or_null(enemy_path_node) as Path2D
	GameState.game_over.connect(_on_game_over)
	await get_tree().process_frame
	_run_waves()

func _run_waves() -> void:
	if level_waves == null or enemy_path == null:
		push_warning("WaveManager: level_waves oder enemy_path nicht gesetzt")
		return
	for i in level_waves.waves.size():
		if _game_over:
			return
		var wave: WaveData = level_waves.waves[i]
		wave_started.emit(i + 1)
		for raw_entry in wave.entries:
			if _game_over:
				return
			var entry: WaveEntry = raw_entry
			for n in entry.count:
				if _game_over:
					return
				_spawn_enemy(entry.enemy_scene)
				await get_tree().create_timer(entry.delay).timeout
	all_waves_completed.emit()

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

func _on_enemy_died(reward: int) -> void:
	EconomyManager.add_gold(reward)

func _on_enemy_reached_end(heart_cost: int) -> void:
	GameState.lose_heart(heart_cost)

func _on_game_over() -> void:
	_game_over = true
