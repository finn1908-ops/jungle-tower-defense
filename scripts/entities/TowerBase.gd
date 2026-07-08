extends Node2D
class_name TowerBase

@export var config: TowerConfig

@onready var _fire_timer: Timer = $FireTimer
@onready var _detection_shape: CollisionShape2D = $DetectionArea/CollisionShape2D
# Sockel- und (optionale) Turret-Nodes. Legacy-Türme besitzen kein Turret;
# get_node_or_null liefert dann null und die Rotation wird übersprungen.
@onready var _base_sprite: Sprite2D = get_node_or_null("Base")
@onready var _turret: Node2D = get_node_or_null("Turret")
@onready var _turret_sprite: Sprite2D = get_node_or_null("Turret/TurretSprite")
@onready var _muzzle: Marker2D = get_node_or_null("Turret/MuzzlePoint")

var _current_target: EnemyBase = null

func _ready() -> void:
	if config == null:
		push_warning("TowerBase '%s': kein TowerConfig zugewiesen" % name)
		return
	if _base_sprite and config.base_texture:
		_base_sprite.texture = config.base_texture
	if _turret_sprite and config.turret_texture:
		_turret_sprite.texture = config.turret_texture
	if _detection_shape.shape is CircleShape2D:
		var shape: CircleShape2D = _detection_shape.shape.duplicate()
		shape.radius = config.attack_range
		_detection_shape.shape = shape
	_fire_timer.wait_time = config.fire_rate
	_fire_timer.timeout.connect(_on_fire_timer_timeout)
	_fire_timer.start()
	GameState.game_over.connect(_on_game_over)

## Turret dreht sich zum Ziel. Legacy-Türme (kein Turret bzw. Rotation aus)
## überspringen diesen Schritt komplett und verhalten sich unverändert.
func _process(delta: float) -> void:
	if not _is_turret_active():
		return
	var target := find_target()
	if target == null:
		return
	var target_angle: float = (target.global_position - global_position).angle()
	# rotate_toward clamped die Änderung und behandelt den Winkel-Wraparound,
	# damit die Rotation nicht wackelt oder überschwingt.
	_turret.rotation = rotate_toward(_turret.rotation, target_angle, config.turret_rotation_speed * delta)

func _on_fire_timer_timeout() -> void:
	if config.attack_behavior == null:
		return
	if find_target() == null:
		return
	# Bei drehbarem Turret erst schießen, wenn er ausreichend ausgerichtet ist.
	if _is_turret_active() and not _is_turret_aligned():
		return
	config.attack_behavior.fire(self)

func _is_turret_active() -> bool:
	return config.turret_rotation_enabled and _turret != null and config.turret_texture != null

func _is_turret_aligned() -> bool:
	var target := find_target()
	if target == null:
		return false
	var target_angle: float = (target.global_position - global_position).angle()
	var diff: float = abs(angle_difference(_turret.global_rotation, target_angle))
	return diff <= deg_to_rad(config.turret_alignment_tolerance_deg)

## Sucht das Ziel (höchster Pfad-Fortschritt in Reichweite) und cached es.
## Öffentlich (kein Underscore-Prefix), weil die AttackBehavior-Komponenten
## es über tower_context.find_target() aufrufen. Gewählt gegenüber einem
## zusätzlichen get_current_target()-Wrapper, weil das nur ein Umbenennen
## ohne neue Methode ist – weniger bewegliche Teile, keine Doppel-API.
func find_target() -> EnemyBase:
	if is_instance_valid(_current_target):
		if global_position.distance_to(_current_target.global_position) <= config.attack_range:
			return _current_target
		_current_target = null
	var best: EnemyBase = null
	var best_progress: float = -1.0
	for enemy in get_tree().get_nodes_in_group("enemies"):
		if not is_instance_valid(enemy):
			continue
		var distance: float = global_position.distance_to(enemy.global_position)
		if distance > config.attack_range:
			continue
		var progress: float = enemy.get_path_progress()
		if progress > best_progress:
			best = enemy
			best_progress = progress
	_current_target = best
	return best

## Globale Mündungsposition für Projektil-/Muzzle-Effekt-Spawn. Ohne
## MuzzlePoint (Legacy-Turm) fällt sie auf die Turm-Position zurück.
func get_muzzle_global_position() -> Vector2:
	if _muzzle:
		return _muzzle.global_position
	return global_position

func _on_game_over() -> void:
	_fire_timer.stop()
