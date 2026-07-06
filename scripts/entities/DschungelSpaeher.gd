extends EnemyBase
class_name DschungelSpaeher

@onready var _animated_sprite: AnimatedSprite2D = $AnimatedSprite2D

var _facing_left: bool = false
var _base_speed: float = 1.0

func _ready() -> void:
	super._ready()
	if config:
		_base_speed = max(config.speed, 0.01)
	if _animated_sprite:
		_animated_sprite.play("walk")

func _physics_process(delta: float) -> void:
	super._physics_process(delta)
	if _is_dead or _game_over:
		return
	_update_facing()
	_update_animation_speed()

func _update_facing() -> void:
	if _path_follow == null:
		return
	var path2d := _path_follow.get_parent() as Path2D
	if path2d == null or path2d.curve == null:
		return
	var curve: Curve2D = path2d.curve
	var length: float = curve.get_baked_length()
	if length <= 0.0:
		return
	var p0: float = clamp(_path_follow.progress, 0.0, length)
	var p1: float = clamp(_path_follow.progress + 1.0, 0.0, length)
	var tangent_x: float = curve.sample_baked(p1).x - curve.sample_baked(p0).x
	if abs(tangent_x) < 0.01:
		return
	var should_face_left: bool = tangent_x < 0.0
	if should_face_left != _facing_left:
		_facing_left = should_face_left
		if _animated_sprite:
			_animated_sprite.flip_h = _facing_left

func _update_animation_speed() -> void:
	if _animated_sprite == null:
		return
	_animated_sprite.speed_scale = max(get_current_speed() / _base_speed, 0.01)
