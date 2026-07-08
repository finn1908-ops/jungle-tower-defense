extends Resource
class_name EffectConfig

## Datengetriebene Beschreibung eines kurzlebigen Effekts (Mündungsfeuer,
## Einschlag, ...). Siehe Asset_Animation_Architektur_v1.md Section 8.2.
## In diesem Refactor wird nur die Resource-Klasse angelegt, damit die
## Turm-Config-Felder (muzzle_effect_config, impact_effect_config) typisiert
## existieren können. Die EffectBase-Szene und das Spawn-Verhalten aus
## Section 8.1/8.3 folgen in einem späteren Auftrag.
@export var sprite_frames: SpriteFrames
@export var animation_name: String = "play"
@export var scale: Vector2 = Vector2.ONE
@export var z_index: int = 0
