Aktueller MVP-Scope: 1 Turm (MG-Turm, integriert und aktiver Starter-Turm), 1 Gegner (Dschungel-Späher), 1 Held (Dschungel-Wächter), 1 Level.

Übergangsstatus: Der MG-Turm ist integriert und im BuildMenu als Starter-Turm aktiv. Das Bogenschützen-Nest ist aus dem BuildMenu entfernt, seine Dateien bleiben aber vorerst als deprecated Legacy im Repo und werden erst in einem separaten Cleanup-Auftrag (nach expliziter Freigabe) entfernt.



Bestätigte Architektur-Entscheidungen (verbindlich, nicht erneut zur Diskussion stellen):

\- WaveManager ist KEIN Autoload-Singleton, sondern ein normaler Node innerhalb jeder Level-Szene (scripts/systems/WaveManager.gd). Grund: Wellendaten sind pro Level unterschiedlich.

\- MVP-Content-Fokus: MG-Turm (Turm) und Dschungel-Späher (Gegner) sind die EINZIGEN Typen, die aktuell produziert/fertiggestellt werden. Bogenschützen-Nest bleibt nur temporär als deprecated Legacy-Starter-Turm erhalten. Dornen-Kaserne und Giftschleuder bleiben inhaltlich pausiert, dürfen aber im TowerBase-Refactor technisch auf die neue AttackBehavior-/TowerBase-Struktur migriert werden. Wildschwein-Rammler und Stein-Panzerkäfer existieren als funktionale Platzhalter und bleiben unangetastet bis der Gegner-Animationsansatz erweitert wird.



Offene Entscheidungen: (leer)



Letzter bestätigter Stand: Entschiedener Animationsansatz (verbindlich): 3-Frame-Ganzkörper-Spritesheet pro Einheit (AnimatedSprite2D, Walk-Loop) + horizontale Spiegelung nach Pfadrichtung. Umgesetzt und bestätigt am Dschungel-Späher.



Update \[heutiges Datum]: Dschungel-Späher-Sprite-Sheet erfolgreich in

korrektem Stil UND mit alternierenden Beinen erstellt. Wichtige neue

Regel: ChatGPT-Image-Prompts IMMER im selben, bereits erfolgreichen Chat

fortsetzen (nicht in neuem Chat), da sich sonst der Bildstil unkontrolliert

verändert. Sprite-Sheet-Frames werden bodenbündig ausgerichtet

(Fuß-Referenzpunkt), nicht einfach in gleiche Drittel geschnitten, um

Jitter zwischen Posen zu vermeiden.






Update [heutiges Datum]: Dschungel-Späher-Animation vollständig
abgeschlossen und in Godot getestet – Stil passt zum Style Guide, Beine
alternieren korrekt zwischen den 3 Posen (kein Jitter mehr). Sprite-Sheet-
Vorlage inkl. der zwei wichtigsten Lektionen (immer im selben ChatGPT-Chat
bleiben; Photopea-Freistellung ist Pflicht, auch bei scheinbar
transparentem Hintergrund; Posen bodenbündig statt gleichmäßig gedrittelt
ausrichten) wurde in Prompt_Baukasten_Assets.md dauerhaft dokumentiert.

Nächste Schritte: TowerBase-Refactor (Sockel + Turret + AttackBehavior) mit Migration der bestehenden Legacy-Türme, dann MG-Turm-Asset-Paket, dann MG-Turm-Integration, danach separater Cleanup des Bogenschützen-Nests, dann Level-Hintergrund-Einbau. Details in Asset_Animation_Architektur_v1.md Section 15.


Update [08.07.2026]: MVP-Fokus bewusst von Bogenschützen-Nest auf MG-Turm umgestellt, weil das Bogenschützen-Nest nicht sauber zum Military-Jungle-StyleGuide passt. Bogenschützen-Nest wird nicht sofort gelöscht, sondern bleibt bis zur erfolgreichen MG-Turm-Integration als deprecated Legacy-Starter-Turm erhalten, damit der Prototyp während des Refactors spielbar bleibt. Dornen-Kaserne und Giftschleuder bleiben inhaltlich pausiert, dürfen aber technisch auf die neue AttackBehavior-/TowerBase-Struktur migriert werden.


Update [08.07.2026]: TowerBase-Refactor kombiniert abgeschlossen: AttackBehavior-Komponenten (SingleTargetAttack, AoEAttack) implementiert, Sockel/Turret-Struktur in TowerBase eingeführt (mit Opt-out über turret_rotation_enabled). Bogenschützen-Nest, Dornen-Kaserne und Giftschleuder auf neues System migriert - Verhalten identisch, keine Änderung im Spielverlauf. Bogenschützen-Nest bleibt deprecated Legacy-Starter bis zur MG-Turm-Integration.

Update [14.07.2026]: MG-Turm integriert (Schritt 5, Asset-Paket asset_paket_mg_turm_lvl1). Neue Szene scenes/towers/MgTurm.tscn (extends TowerBase, Sockel/Turret + MuzzlePoint), Resource resources/towers/mg_turm.tres, Projektil-Szene scenes/towers/MgProjectile.tscn. EffectBase-System ist jetzt Ist-Zustand (nicht mehr nur geplant): scripts/entities/EffectBase.gd + scenes/effects/EffectBase.tscn spielen datengetriebene EffectConfig-SpriteFrames einmal ab und räumen sich selbst auf. SingleTargetAttack spawnt Mündungsfeuer (muzzle_effect_config) am MuzzlePoint; ProjectileBase.launch() nimmt jetzt optional eine impact_effect_config entgegen und spawnt beim Einschlag einen EffectBase-Effekt (Legacy-CPUParticles2D bleibt als dokumentierter Fallback bei null). Effekt-Resources: resources/effects/muendungsfeuer_klein.tres, resources/effects/kugel_einschlag.tres. MG-Turm ist neuer Starter-Turm im BuildMenu (PrototypeLevel HUD), Bogenschützen-Nest aus dem BuildMenu entfernt (Dateien bleiben bis Cleanup). Platzhalter-Werte (damage 4, fire_rate 0.2, range 200, cost 50, Sprite-Skalierungen, Effekt-scale) sowie MuzzlePoint (23.53, -2.73 = Turret-Offset 181,-21 * 0.13) werden im Balancing-Pass / manuellen Godot-Test kalibriert. Manuelle Test-Checkliste aus dem Asset-Paket steht noch aus.
