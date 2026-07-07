extends Node2D

@export var starting_gold: int = 100
@export var starting_hearts: int = 20

@onready var _enemy_path: Path2D = $EnemyPath
@onready var _path_visual: Line2D = $PathVisual

func _ready() -> void:
	get_viewport().physics_object_picking = true
	EconomyManager.reset_gold(starting_gold)
	GameState.reset(starting_hearts)
	_build_path()

## Geschwungene Streckenfuehrung innerhalb des 1920x1080-Spielfelds, Tangenten
## per Catmull-Rom-Handles gesetzt statt scharfer 90-Grad-Ecken.
func _build_path() -> void:
	var curve := Curve2D.new()
	curve.add_point(Vector2(70, 540), Vector2.ZERO, Vector2(140, 0))
	curve.add_point(Vector2(480, 540), Vector2(-110.8, 85.6), Vector2(110.8, -85.6))
	curve.add_point(Vector2(480, 200), Vector2(-124.8, 63.4), Vector2(124.8, -63.4))
	curve.add_point(Vector2(1150, 200), Vector2(-100.5, -97.5), Vector2(100.5, 97.5))
	curve.add_point(Vector2(1150, 850), Vector2(-104.6, -93.1), Vector2(104.6, 93.1))
	curve.add_point(Vector2(1850, 850), Vector2(-140, 0), Vector2.ZERO)
	_enemy_path.curve = curve
	_path_visual.points = curve.get_baked_points()
