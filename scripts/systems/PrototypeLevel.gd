extends Node2D

@export var starting_gold: int = 100
@export var starting_hearts: int = 20

@onready var _enemy_path: Path2D = $EnemyPath

func _ready() -> void:
	get_viewport().physics_object_picking = true
	EconomyManager.reset_gold(starting_gold)
	GameState.reset(starting_hearts)
	_build_path()

func _build_path() -> void:
	var curve := Curve2D.new()
	curve.add_point(Vector2(-480, 0))
	curve.add_point(Vector2(-200, 0))
	curve.add_point(Vector2(-200, -260))
	curve.add_point(Vector2(280, -260))
	curve.add_point(Vector2(280, 260))
	curve.add_point(Vector2(600, 260))
	_enemy_path.curve = curve
