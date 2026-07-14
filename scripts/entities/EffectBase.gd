extends Node2D
class_name EffectBase

## Kurzlebiger, datengetriebener Effekt (Muendungsfeuer, Einschlag, ...).
## Spielt die per EffectConfig referenzierten SpriteFrames genau einmal ab und
## entfernt sich danach selbst (animation_finished -> queue_free).
## Siehe Asset_Animation_Architektur_v1.md Abschnitt 8.1/8.3.
## Der Spawner setzt vor add_child() das Feld config; Textur/Skalierung/z_index
## kommen ausschliesslich aus der EffectConfig.
@export var config: EffectConfig

@onready var _sprite: AnimatedSprite2D = $AnimatedSprite2D

func _ready() -> void:
	if config == null or config.sprite_frames == null:
		queue_free()
		return
	_sprite.sprite_frames = config.sprite_frames
	_sprite.scale = config.scale
	z_index = config.z_index
	# animation_finished feuert nur bei nicht-loopender Animation - die
	# Effekt-SpriteFrames sind bewusst mit loop=false angelegt.
	_sprite.animation_finished.connect(queue_free)
	_sprite.play(config.animation_name)
