extends Node2D

@onready var _enemy_path: Path2D = $EnemyPath
@onready var _tower_slot: Marker2D = $TowerSlot

func _ready() -> void:
	_build_path()
	print("[DEBUG] EnemyPath curve point_count=%d baked_length=%.1f" % [
		_enemy_path.curve.point_count, _enemy_path.curve.get_baked_length()
	])
	print("[DEBUG] TowerSlot global_position=%s child_count=%d" % [
		_tower_slot.global_position, _tower_slot.get_child_count()
	])
	for child in _tower_slot.get_children():
		print("[DEBUG]   tower instance '%s' global_position=%s visible=%s" % [
			child.name, child.global_position, child.visible
		])
	var cam := get_viewport().get_camera_2d()
	print("[DEBUG] active Camera2D=%s viewport_size=%s" % [
		(cam.name if cam else "NONE - kein Kamera aktiv!"), get_viewport().get_visible_rect().size
	])

func _build_path() -> void:
	var curve := Curve2D.new()
	curve.add_point(Vector2(-480, 0))
	curve.add_point(Vector2(-200, 0))
	curve.add_point(Vector2(-200, -260))
	curve.add_point(Vector2(280, -260))
	curve.add_point(Vector2(280, 260))
	curve.add_point(Vector2(600, 260))
	_enemy_path.curve = curve
