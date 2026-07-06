extends Area2D
class_name TowerSlot

signal slot_tapped(slot: TowerSlot)

var is_occupied: bool = false
var placed_tower: TowerBase = null

func _ready() -> void:
	input_event.connect(_on_input_event)
	queue_redraw()

func _on_input_event(_viewport: Node, event: InputEvent, _shape_idx: int) -> void:
	var tapped: bool = (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT) \
		or (event is InputEventScreenTouch and event.pressed)
	if tapped:
		slot_tapped.emit(self)

func place_tower(tower_scene: PackedScene) -> void:
	if is_occupied or tower_scene == null:
		return
	var tower: TowerBase = tower_scene.instantiate()
	add_child(tower)
	placed_tower = tower
	is_occupied = true
	queue_redraw()

func get_refund_amount() -> int:
	if not is_occupied or placed_tower == null or placed_tower.config == null:
		return 0
	return int(round(placed_tower.config.cost * placed_tower.config.sell_refund_percent))

func remove_tower() -> int:
	var refund := get_refund_amount()
	if placed_tower:
		placed_tower.queue_free()
	placed_tower = null
	is_occupied = false
	queue_redraw()
	return refund

func _draw() -> void:
	if is_occupied:
		return
	draw_circle(Vector2.ZERO, 28.0, Color(1.0, 1.0, 1.0, 0.22))
	draw_arc(Vector2.ZERO, 28.0, 0.0, TAU, 32, Color(1.0, 1.0, 1.0, 0.55), 2.0)
