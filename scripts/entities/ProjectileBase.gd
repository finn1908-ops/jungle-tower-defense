extends Node2D
class_name ProjectileBase

@export var speed: float = 700.0

var _target: EnemyBase = null
var _on_hit: Callable = Callable()

## Startet den Flug zum Ziel. on_hit wird nur aufgerufen, wenn das Ziel beim
## Aufprall noch existiert - stirbt/despawnt es vorher, verpufft das
## Projektil einfach ohne Schaden und ohne Fehler.
func launch(target: EnemyBase, on_hit: Callable) -> void:
	_target = target
	_on_hit = on_hit
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
	var effect := CPUParticles2D.new()
	effect.emitting = false
	effect.one_shot = true
	effect.amount = 10
	effect.lifetime = 0.25
	effect.explosiveness = 1.0
	effect.spread = 180.0
	effect.initial_velocity_min = 40.0
	effect.initial_velocity_max = 100.0
	effect.scale_amount_min = 2.5
	effect.scale_amount_max = 2.5
	effect.color = Color(1.0, 0.85, 0.3)
	get_parent().add_child(effect)
	effect.global_position = global_position
	effect.emitting = true
	get_tree().create_timer(effect.lifetime + 0.15).timeout.connect(effect.queue_free)
