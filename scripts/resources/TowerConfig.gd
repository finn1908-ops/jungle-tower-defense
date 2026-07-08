extends Resource
class_name TowerConfig

@export var display_name: String = ""

## Sockel-Textur (statischer Turm-Unterbau). Ersetzt das frühere Feld
## "texture". Bei Legacy-Türmen ohne separates Turret übernimmt der
## Base-Sprite die gesamte, bisher monolithische Darstellung.
@export var base_texture: Texture2D
## Turret-Textur (rotierbares Oberteil). Darf null sein; wenn null, gilt
## automatisch turret_rotation_enabled = false (siehe TowerBase).
@export var turret_texture: Texture2D
@export var turret_rotation_enabled: bool = true
## Dreh-Geschwindigkeit des Turrets in Radiant pro Sekunde.
@export var turret_rotation_speed: float = 5.0
## Winkeltoleranz (Grad), innerhalb derer geschossen werden darf.
@export var turret_alignment_tolerance_deg: float = 5.0

@export var cost: int = 50
@export var sell_refund_percent: float = 0.7

@export var damage: int = 5
@export var fire_rate: float = 1.0
@export var attack_range: float = 150.0

## Angriffsart als austauschbare Resource-Komponente (ersetzt das frühere
## is_aoe-Bool). Siehe scripts/entities/attack_behaviors/.
@export var attack_behavior: AttackBehavior

## Datengetriebenes Mündungsfeuer bzw. Einschlagseffekt. Bei Legacy-Türmen
## null (optisch unverändert). Spawn-Verhalten folgt in späterem Auftrag.
@export var muzzle_effect_config: EffectConfig
@export var impact_effect_config: EffectConfig

@export var dot_damage_per_tick: int = 0
@export var dot_tick_interval: float = 1.0
@export var dot_duration: float = 0.0

## Optional: sichtbares Projektil (ProjectileBase-Szene). Wenn nicht gesetzt,
## trifft der Turm sein Ziel weiterhin sofort (Instant-Hit).
@export var projectile_scene: PackedScene
