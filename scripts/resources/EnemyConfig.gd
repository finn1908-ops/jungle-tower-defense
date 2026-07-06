extends Resource
class_name EnemyConfig

@export var display_name: String = ""
@export var texture: Texture2D

@export var hp: int = 10
@export var speed: float = 80.0
@export var reward: int = 5
@export var heart_cost: int = 1

@export var enrage_hp_threshold: float = 0.0
@export var enrage_speed_multiplier: float = 1.0
