extends AttackBehavior
class_name SingleTargetAttack

## Einzelziel-Angriff. Enthält die frühere TowerBase._fire_single-Logik:
## Ziel suchen, dann entweder ein Projektil spawnen (falls
## config.projectile_scene gesetzt) oder direkten Schaden anwenden.
func fire(tower_context: TowerBase) -> void:
	var target := tower_context.find_target()
	if target == null:
		return
	if tower_context.config.projectile_scene:
		_fire_projectile(tower_context, target)
	else:
		_apply_hit(target, tower_context)

func _fire_projectile(tower_context: TowerBase, target: EnemyBase) -> void:
	var projectile: ProjectileBase = tower_context.config.projectile_scene.instantiate()
	tower_context.get_tree().current_scene.add_child(projectile)
	# Spawn ab jetzt an der Mündung des Turrets; bei Legacy-Türmen ohne
	# MuzzlePoint liefert get_muzzle_global_position() die Turm-Position
	# zurück – identisch zum bisherigen Verhalten.
	projectile.global_position = tower_context.get_muzzle_global_position()
	# ProjectileBase.launch ruft den Callback mit dem Ziel als einzigem
	# Argument auf; bind() hängt tower_context als letztes Argument an,
	# darum ist die Signatur (enemy, tower_context).
	projectile.launch(target, _apply_hit.bind(tower_context))

func _apply_hit(enemy: EnemyBase, tower_context: TowerBase) -> void:
	enemy.take_damage(tower_context.config.damage)
	if tower_context.config.dot_duration > 0.0:
		enemy.apply_poison(tower_context.config.dot_damage_per_tick, tower_context.config.dot_tick_interval, tower_context.config.dot_duration)
