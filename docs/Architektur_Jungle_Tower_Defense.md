# Architektur-Dokument: Jungle Tower Defense

**Status:** v0.1 – Grundlage für Claude Code / Codex
**Engine:** Godot 4.7, GDScript, Mobile-Renderer

---

## 1. Überblick

Szenen-basierte Architektur mit Autoload-Singletons für übergreifenden
Zustand, daten-getriebener Konfiguration über Godot-Resources (`.tres`)
für Türme/Gegner/Wellen (damit Balancing ohne Code-Änderung möglich ist),
und Signal-basierter Kommunikation statt harter Objekt-Referenzen quer
durch die Szene.

---

## 2. Ordnerstruktur (verbindlich für Claude Code & Codex)

```
res://
├── scenes/
│   ├── levels/      (Level1.tscn, Level2.tscn, ...)
│   ├── towers/      (eine .tscn pro Turmtyp)
│   ├── enemies/     (eine .tscn pro Gegnertyp)
│   ├── heroes/
│   └── ui/
├── scripts/
│   ├── autoload/    (Singletons)
│   ├── systems/     (TowerManager, WaveManager, EconomySystem, ...)
│   ├── entities/    (TowerBase.gd, EnemyBase.gd, HeroBase.gd)
│   ├── resources/   (Resource-Skriptklassen: TowerConfig.gd, EnemyConfig.gd,
│   │                 WaveEntry.gd, WaveData.gd, LevelWaves.gd – definieren
│   │                 das Schema für die .tres-Dateien unter resources/)
│   └── ui/
├── resources/
│   ├── towers/      (.tres Konfiguration pro Turm)
│   ├── enemies/     (.tres Konfiguration pro Gegner)
│   └── waves/       (.tres Wellen-Komposition pro Level)
├── assets/
│   ├── sprites/
│   ├── audio/
│   └── fonts/
├── shaders/
└── docs/
```

---

## 3. Kernsysteme (Autoload-Singletons)

- **GameState** – Level-Fortschritt, Sterne, freigeschaltete Level
- **EconomyManager** – Gold, Ein-/Ausgaben, Signal `gold_changed`
- **AudioManager** – Platzhalter, wird konkretisiert sobald Sound-Tool
  feststeht

**Korrektur (nach Prototyp-Umsetzung):** `WaveManager` ist **kein**
Autoload, sondern ein normaler Node innerhalb jeder Level-Szene
(`scripts/systems/WaveManager.gd`). Begründung: Wellendaten sind pro
Level unterschiedlich – ein globales Autoload würde bei Levelwechsel
unnötig Zustand mitschleppen. Jede Level-Szene instanziiert ihren
eigenen WaveManager und verbindet ihn mit den globalen Singletons
(`EconomyManager`, `GameState`) über Signale.

---

## 4. Entity-Basisklassen

- **`TowerBase.gd`** – gemeinsame Logik aller Türme: Reichweiten-Erkennung,
  Ziel-Auswahl, Schuss-Timer. Liest alle Werte aus der zugehörigen
  `.tres`-Config, keine Werte hart im Code
- **`EnemyBase.gd`** – Bewegung entlang `Path2D`/`PathFollow2D`, HP,
  Status-Effekte (Gift-Damage-over-Time, Feuer-Ausbreitung)
- **`HeroBase.gd`** – Nahkampf-Logik, Fähigkeiten-Cooldown, XP/Level (ob
  persistent oder pro Level ist noch offen, siehe GDD Abschnitt 8 –
  Architektur unterstützt beides, Entscheidung verschiebt sich in
  `GameState`)

Jeder neue Turm-/Gegner-/Helden-Typ **erbt** von der jeweiligen Basisklasse.
Keine Duplizierung von Logik in einzelnen Typen.

---

## 5. Daten-getriebene Konfiguration (wichtig fürs Balancing)

Jeder Turm/Gegner ist eine eigene `.tres`-Resource-Datei, keine
Hardcoded-Werte im Code. Dadurch fließen Balancing-Werte direkt in diese
Dateien, ohne dass Code angefasst wird.

Beispiel-Felder einer `TowerConfig`-Resource:
`damage`, `fire_rate`, `range`, `cost`, `sell_refund_percent`,
`upgrade_paths` (Array – trägt die Bloons-TD-Verzweigung ab Stufe 2)

---

## 6. Wellen- & Pfadsystem

- Pfad: ein `Path2D`-Node pro Level, Gegner nutzen `PathFollow2D` zur
  Bewegung
- Wellen: eine `.tres`-Resource pro Level mit einer Liste aus
  (Gegnertyp, Anzahl, Verzögerung)

---

## 7. Signal-Kommunikation

Systeme kommunizieren über Godot-Signals, nicht über direkte
Objekt-Referenzen: z. B. `EconomyManager.gold_changed`,
`WaveManager.wave_completed`, `EnemyBase.enemy_died(reward)`. Hält
Systeme entkoppelt und einzeln testbar.

---

## 8. Wind-Shader (Umgebung)

Eigenes Shader-Material `shaders/wind_sway.gdshader` auf
Vegetations-Sprites. Vertex-Offset basierend auf Zeit + Höhe im Sprite
(Wurzel bleibt fest, Krone bewegt sich). Keine GDScript-Logik nötig,
reiner Shader-Effekt.

---

## 9. Speichersystem

`user://savegame.json` (oder Godot `ConfigFile`) – speichert
freigeschaltete Level, Sterne pro Level, ggf. permanente
Feldlager-Upgrades (siehe GDD Abschnitt 10).

---

## 10. Bewusst noch nicht entschieden

- Heldenprogression permanent vs. pro Level (offene GDD-Frage)
- Genaues Wellen-Balancing (kommt in Schritt 6 des Ablaufplans)
- Monetarisierungs-Technik/Plugin (erst wenn Monetarisierung entschieden
  ist)
- **Dornen-Kaserne (Blocker-Einheiten-System):** GDD 5.2 sieht spawnbare,
  respawnende Nahkampf-Kämpfer vor, die physisch auf dem Pfad stehen und
  Gegner aufhalten. Das erfordert Mechanik, die es noch nicht gibt
  (Gegner müssen anhalten/kämpfen können, blockierbare Einheiten mit
  eigener HP). Aktuell (Content-Produktionsschritt) approximiert als
  Nahkampf-AoE mit sehr kurzer Reichweite auf Basis von `TowerBase.gd` –
  bewusste Interimslösung. Das echte Blocker-System wird vor Schritt 7
  (Polish) separat spezifiziert und nachgebaut.

---

## 11. Verbindliche Konventionen für Claude Code & Codex

- Klassen/Scene-Dateien: PascalCase (`TowerBase.gd`, `Level1.tscn`)
- Resource-Dateien: snake_case (`mg_turm.tres`, `dschungel_spaeher.tres`)
- Jede neue Einheit erbt von ihrer Basisklasse – keine Kopien der Logik
- Neue Systeme binden sich über Signals an, keine `get_node()`-Ketten quer
  durch mehrere Szenen-Ebenen
- Balancing-Werte gehören in `.tres`-Dateien, niemals hart in `.gd`-Dateien
