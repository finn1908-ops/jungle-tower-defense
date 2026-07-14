extends Node2D
class_name ProjectileBase

const EFFECT_SCENE: PackedScene = preload("res://scenes/effects/EffectBase.tscn")

@export var speed: float = 700.0

var _target: EnemyBase = null
var _on_hit: Callable = Callable()
# Optionaler Einschlagseffekt für diesen Flug (aus config.impact_effect_config).
# null -> Legacy-CPUParticles2D-Fallback in _spawn_hit_effect().
var _impact_effect: EffectConfig = null

## Startet den Flug zum Ziel. on_hit wird nur aufgerufen, wenn das Ziel beim
## Aufprall noch existiert - stirbt/despawnt es vorher, verpufft das
## Projektil einfach ohne Schaden und ohne Fehler. impact_effect ist optional
## (Default null hält bestehende Aufrufer kompatibel).
func launch(target: EnemyBase, on_hit: Callable, impact_effect: EffectConfig = null) -> void:
	_target = target
	_on_hit = on_hit
	_impact_effect = impact_effect
	if is_instance_valid(_target):
		rotation = (_target.global_position - global_position).angle()

func _physics_process(delta: float) -> void:
	if not is_instance_valid(_target):
		queue_free()
		return
	var to_target: Vector2 = _target.global_position - global_position
	var step: float = speed * delta
	if to_target.length() <= step:
		_impact()
		return
	rotation = to_target.angle()
	global_position += to_target.normalized() * step

func _impact() -> void:
	if is_instance_valid(_target) and _on_hit.is_valid():
		_on_hit.call(_target)
	_spawn_hit_effect()
	queue_free()

func _spawn_hit_effect() -> void:
	if _impact_effect != null:
		# Datengetriebener Einschlagseffekt über EffectBase (spielt einmal ab
		# und räumt sich selbst auf). Als Kind des Eltern-Nodes, damit er den
		# queue_free() des Projektils überlebt.
		var effect: EffectBase = EFFECT_SCENE.instantiate()
		effect.config = _impact_effect
		get_parent().add_child(effect)
		effect.global_position = global_position
		return
	# ponytail: Legacy-Fallback für Projektile ohne impact_effect_config
	# (z. B. Bogenschützen-Nest). Bewusst als dokumentierter Fallback erhalten;
	# läuft nie parallel zur EffectBase-Lösung (early return oben).
	var particles := CPUParticles2D.new()
	particles.emitting = false
	particles.one_shot = true
	particles.amount = 10
	particles.lifetime = 0.25
	particles.explosiveness = 1.0
	particles.spread = 180.0
	particles.initial_velocity_min = 40.0
	particles.initial_velocity_max = 100.0
	particles.scale_amount_min = 2.5
	particles.scale_amount_max = 2.5
	particles.color = Color(1.0, 0.85, 0.3)
	get_parent().add_child(particles)
	particles.global_position = global_position
	particles.emitting = true
	get_tree().create_timer(particles.lifetime + 0.15).timeout.connect(particles.queue_free)
