extends Resource
class_name AttackBehavior

## Führt einen Angriff aus. tower_context ist der aufrufende
## Turm und enthält Position, Config, Zugriff auf Effekte usw.
func fire(tower_context: TowerBase) -> void:
	push_error("AttackBehavior.fire() muss ueberschrieben werden")
