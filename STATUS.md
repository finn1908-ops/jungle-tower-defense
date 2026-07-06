Aktueller MVP-Scope: 1 Turm (Bogenschützen-Nest), 1 Gegner (Dschungel-Späher), 1 Held (Dschungel-Wächter), 1 Level.



Bestätigte Architektur-Entscheidungen (verbindlich, nicht erneut zur Diskussion stellen):

\- WaveManager ist KEIN Autoload-Singleton, sondern ein normaler Node innerhalb jeder Level-Szene (scripts/systems/WaveManager.gd). Grund: Wellendaten sind pro Level unterschiedlich.

\- MVP-Content-Fokus: Bogenschützen-Nest (Turm) und Dschungel-Späher (Gegner) sind die EINZIGEN Typen, die aktuell animiert/fertiggestellt werden. Dornen-Kaserne, Giftschleuder, Wildschwein-Rammler, Stein-Panzerkäfer existieren bereits als Szenen/Configs, bleiben aber unangetastet bis der Animationsansatz bestätigt ist.



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

Nächste offene Content-Bausteine für den vertikalen Durchstich (1 Turm,
1 Gegner, 1 Level mit Pfad):
- Turm-Sprite (Bogenschützen-Nest), statisches Bild – Prompt liegt bereit
- Levelhintergrund (Boden- und Pfad-Textur, kachelbar) – Prompts liegen
  bereit
