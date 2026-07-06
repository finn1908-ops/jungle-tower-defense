# Prototyp-Spezifikation: Core-Loop (Schritt 4)

**Ziel:** Minimal spielbarer Kern – 1 Pfad, 1 Turm-Platzhalter, 1
Gegner-Platzhalter, keine echte Grafik (nur einfache Formen). Zweck: prüfen,
ob die Kernschleife funktioniert und Spaß macht, bevor Zeit in Content
investiert wird. Basiert auf `docs/Architektur.md`.

---

## Im Scope (muss der Prototyp können)

- Ein Level mit festem Gegner-Pfad
- Ein Gegner-Typ (Platzhalter-Form), läuft den Pfad entlang, hat HP
- Ein Turm-Typ (Platzhalter-Form) an fester Position, erkennt Gegner in
  Reichweite, schießt in Intervallen, verursacht Schaden
- Einfache Wellensteuerung: spawnt mehrere Gegner nacheinander mit Verzögerung
- Einfache Wirtschaft: Gold-Zähler, Gegner-Tod gibt Gold
- Einfaches HUD: Gold-Anzeige, Herzen-Anzeige, Wellen-Nummer
- Gegner am Pfadende: kostet 1 Herz, wird entfernt
- Gegner besiegt: gibt Gold, verschwindet

## Explizit NICHT im Scope (kommt später)

- Kein Held, keine Fähigkeiten
- Keine Turm-Upgrades
- Keine echten Sprites/Animationen (nur ColorRect/Polygon2D als Platzhalter)
- Kein Sound
- Kein Menü, keine Levelauswahl
- Nur 1 fester Turm-Slot, keine freie Platzierung

---

## Node-/Datei-Struktur (folgt docs/Architektur.md)

**scenes/levels/PrototypeLevel.tscn**
- `Node2D "Level"`
  - `Path2D "EnemyPath"` (einfache Kurve)
  - `Marker2D "TowerSlot"` (ein fester Platzierungspunkt für den Turm)
  - `CanvasLayer "HUD"` mit Labels für Gold, Herzen, Welle

**scenes/enemies/EnemyPrototype.tscn**
- `Node2D` mit Skript `EnemyBase.gd`, Platzhalter-Grafik (z. B. rotes
  Rechteck), wird zur Laufzeit als Kind eines `PathFollow2D` auf
  `EnemyPath` gespawnt, gehört zur Godot-Gruppe `"enemies"`

**scripts/entities/EnemyBase.gd**
- Felder: `hp`, `speed`, `reward`
- Bewegt sich über `PathFollow2D.progress`
- Methode `take_damage(amount)`
- Signale: `enemy_died(reward)`, `enemy_reached_end()`

**scripts/entities/TowerBase.gd**
- `Area2D`-Kind für Reichweiten-Erkennung
- `Timer` für Feuerrate
- Sucht nächsten Gegner über `get_tree().get_nodes_in_group("enemies")`
  innerhalb der Reichweite, verursacht bei Timer-Ablauf Schaden

**scripts/systems/WaveManager.gd** (Node in der Level-Szene)
- Liste aus (Anzahl, Verzögerung), spawnt `EnemyPrototype`-Instanzen
  nacheinander auf `EnemyPath`

**scripts/autoload/EconomyManager.gd** (Singleton)
- `gold: int`, Signal `gold_changed(new_amount)`
- Methoden `add_gold(amount)`, `spend_gold(amount) -> bool`

**scripts/autoload/GameState.gd** (Singleton)
- `hearts: int`, Signal `hearts_changed(new_amount)`
- Methode `lose_heart()`

---

## Akzeptanzkriterium für diesen Prototyp

Eine Welle mit mehreren Gegnern läuft durch, der Turm schießt automatisch,
tote Gegner geben Gold, durchgekommene Gegner kosten Herzen, HUD zeigt
alle drei Werte live an. Wenn das läuft, ist Schritt 4 abgeschlossen.
