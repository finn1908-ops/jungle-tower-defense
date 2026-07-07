extends Resource
class_name TowerConfig

@export var display_name: String = ""
@export var texture: Texture2D

@export var cost: int = 50
@export var sell_refund_percent: float = 0.7

@export var damage: int = 5
@export var fire_rate: float = 1.0
@export var attack_range: float = 150.0

@export var is_aoe: bool = false
@export var dot_damage_per_tick: int = 0
@export var dot_tick_interval: float = 1.0
@export var dot_duration: float = 0.0

## Optional: sichtbares Projektil (ProjectileBase-Szene). Wenn nicht gesetzt,
## trifft der Turm sein Ziel weiterhin sofort (Instant-Hit).
@export var projectile_scene: PackedScene
