extends AttackBehavior
class_name AoEAttack

## Flächen-Angriff. Enthält die frühere TowerBase._fire_aoe-Logik:
## trifft alle Gegner in config.attack_range gleichzeitig und wendet
## Schaden sowie – falls konfiguriert – Gift-DoT an.
func fire(tower_context: TowerBase) -> void:
	for enemy in tower_context.get_tree().get_nodes_in_group("enemies"):
		if not is_instance_valid(enemy):
			continue
		if tower_context.global_position.distance_to(enemy.global_position) <= tower_context.config.attack_range:
			_apply_hit(enemy, tower_context)

func _apply_hit(enemy: EnemyBase, tower_context: TowerBase) -> void:
	enemy.take_damage(tower_context.config.damage)
	if tower_context.config.dot_duration > 0.0:
		enemy.apply_poison(tower_context.config.dot_damage_per_tick, tower_context.config.dot_tick_interval, tower_context.config.dot_duration)
