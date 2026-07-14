# Asset- & Animations-Architektur v1: Jungle Tower Defense

**Status:** v1.2 – verbindlich ab diesem Datum (siehe Änderungshistorie am Ende)
**Engine:** Godot 4.7, GDScript, Mobile-Renderer
**Verhältnis zu anderen Dokumenten:**
Dieses Dokument **ergänzt** `Architektur_Jungle_Tower_Defense.md`, ohne dessen
Aussagen zu ersetzen. Wenn beide Dokumente sich widersprechen, gilt bei
Fragen zur Ordnerstruktur und den grundsätzlichen Systemen das ältere
Dokument, bei allen Fragen zu Assets, Animationen, Effekten und
Turm-Komponenten dieses hier. STATUS.md bleibt in Konfliktfällen die
Letztinstanz (siehe dortige Regel).

---

## 1. Zweck dieses Dokuments

Der bestehende Vertical Slice läuft: ein Turm, ein Gegner, Wellen,
Platzieren/Verkaufen, Gold, Herzen, Sterne, Game-Over. Die Kernarchitektur
(Basisklassen, Resource-Configs, Signal-Kommunikation) steht. Was fehlt,
sind die Regeln für den **Skalierungsschritt** – also alles, was danach
kommt, wenn ein zweiter/dritter Turm dazukommt, wenn Effekte ins Spiel
sollen, wenn Gegner nicht mehr nur "laufen und sterben" sollen.

Ohne dieses Dokument passieren zwei Dinge, die wir vermeiden wollen:
1. Jeder neue Turm bekommt seinen eigenen Sonderfall im Code
   (`if config.is_flamethrower: ...` bis zum Chaos)
2. Assets werden als isolierte Einzelbilder produziert, deren
   Integration jedes Mal neu erfunden werden muss

Beides skaliert nicht. Dieses Dokument zieht die Leitplanken, damit weder
Codebase noch Asset-Pipeline zerfließen.

---

## 2. Asset-Kategorien

Alle visuellen Assets im Projekt fallen in genau **eine** dieser
Kategorien. Die Kategorie bestimmt Ordnerablage, Namenskonvention,
Pivot-Regel und Integrationspfad.

| Kategorie | Beispiel | Ordner |
|---|---|---|
| **Gegner-Sprite** | Dschungel-Späher walk sheet | `assets/sprites/enemies/` |
| **Turm-Sprite** | Bogenschützen-Nest idle | `assets/sprites/towers/` |
| **Projektil-Sprite** | Pfeil, Rakete | `assets/sprites/projectiles/` |
| **Effekt-Sprite** | Mündungsfeuer, Einschlag, Explosion | `assets/sprites/effects/` |
| **Bauplatz-Sprite** | Hover-Overlay, Selected-Overlay | `assets/sprites/buildspots/` |
| **Level-Hintergrund** | `level_01_jungle_background.png` | `assets/backgrounds/` |
| **UI-Icon** | Turm-Icon fürs BuildMenu, Herz, Münze | `assets/sprites/ui/icons/` |
| **UI-Element** | Panel-Rahmen, Button-Textur | `assets/sprites/ui/elements/` |
| **Font** | Titel-Font, HUD-Font | `assets/fonts/` |
| **Shader** | Wind-Sway, Hit-Flash | `shaders/` |

Alles was nicht in diese Tabelle passt, ist ein Warnsignal, dass eine
neue Kategorie fehlt – dann wird dieses Dokument aktualisiert, nicht
improvisiert.

---

## 3. Namenskonventionen (verbindlich)

Regeln gelten strikt für alle **neu erstellten** Assets. Bestehende
Dateien werden bei Gelegenheit angepasst, nicht sofort umbenannt.

**Grundregeln:**
- Alle Asset-Dateinamen: `snake_case`, keine Umlaute, keine Leerzeichen
- Deutsche Bezeichnungen sind erlaubt und erwünscht (`bogenschuetzen_nest`
  statt `archer_tower`) – bleibt konsistent mit `display_name` in den
  `.tres`-Configs
- Scripts und Szenen bleiben `PascalCase` (unverändert zur bestehenden
  Konvention)

**Muster pro Kategorie:**

```
Gegner:
  enemy_<name>_<animation>_sheet.png
  enemy_<name>_shadow.png
  Beispiele:
    enemy_dschungel_spaeher_walk_sheet.png
    enemy_dschungel_spaeher_death_sheet.png
    enemy_dschungel_spaeher_shadow.png

Türme:
  tower_<name>_lvl<n>_<state>.png
  tower_<name>_lvl<n>_icon.png
  Beispiele:
    tower_bogenschuetzen_nest_lvl1_idle.png
    tower_bogenschuetzen_nest_lvl1_fire_sheet.png
    tower_bogenschuetzen_nest_lvl1_icon.png

Projektile:
  projectile_<name>.png
  Beispiel:
    projectile_pfeil.png

Effekte:
  effect_<name>_<size>_sheet.png
  Beispiele:
    effect_muendungsfeuer_klein_sheet.png
    effect_pfeil_einschlag_sheet.png
    effect_explosion_mittel_sheet.png

Bauplätze:
  buildspot_<state>.png
  Beispiele:
    buildspot_hover.png
    buildspot_selected.png

Level-Hintergründe:
  level_<nn>_<name>_background.png
  Beispiel:
    level_01_jungle_background.png

UI-Icons:
  ui_icon_<kategorie>_<name>.png
  Beispiele:
    ui_icon_tower_bogenschuetzen_nest_lvl1.png
    ui_icon_currency_gold.png
    ui_icon_currency_heart.png
```

**Sprite-Sheets** tragen immer das Suffix `_sheet` im Dateinamen, damit
sofort erkennbar ist, dass es sich um mehrere Frames handelt.

**Auf Godot-Seite** (Skripte, Szenen, Resource-Klassen) bleibt die
bestehende Konvention aus `Architektur_Jungle_Tower_Defense.md` Abschnitt 11
unverändert.

---

## 4. Ordnerstruktur – Ergänzung

Die bestehende Struktur aus dem Architektur-Dokument (Abschnitt 2) bleibt
gültig. Zur besseren Orientierung hier die vollständige, aktualisierte
Ordnerstruktur mit den Ergänzungen aus diesem Dokument (mit `NEU`
markiert). Kommentare in Klammern nennen exemplarisch, was aktuell drin
liegt – keine vollständige Dateiliste, sondern Orientierungshilfe:

```
res://
├── scenes/
│   ├── levels/                 (PrototypeLevel.tscn; später Level1..N.tscn)
│   ├── towers/                 (eine .tscn pro Turmtyp,
│   │                            ProjectileBase.tscn)
│   ├── enemies/                (eine .tscn pro Gegnertyp)
│   ├── heroes/                 (später: HeroBase.tscn, konkrete Helden)
│   ├── effects/                (NEU – EffectBase.tscn + konkrete Effekte)
│   └── ui/                     (wiederverwendbare UI-Szenen, z. B. Panels)
├── scripts/
│   ├── autoload/               (EconomyManager.gd, GameState.gd)
│   ├── systems/                (WaveManager.gd, PrototypeLevel.gd, …)
│   ├── entities/
│   │   ├── TowerBase.gd, EnemyBase.gd, TowerSlot.gd,
│   │   │   ProjectileBase.gd, konkrete Entity-Skripte
│   │   ├── attack_behaviors/   (NEU – AttackBehavior.gd,
│   │   │                        SingleTargetAttack.gd, AoEAttack.gd,
│   │   │                        siehe Abschnitt 9)
│   │   └── EffectBase.gd       (NEU – siehe Abschnitt 8)
│   ├── resources/              (TowerConfig.gd, EnemyConfig.gd,
│   │                            WaveEntry.gd, WaveData.gd,
│   │                            LevelWaves.gd,
│   │                            EffectConfig.gd (NEU))
│   └── ui/                     (HUD.gd, später weitere UI-Skripte)
├── resources/
│   ├── towers/                 (.tres Konfiguration pro Turm)
│   ├── enemies/                (.tres Konfiguration pro Gegner)
│   ├── waves/                  (.tres Wellen-Komposition pro Level)
│   ├── effects/                (NEU – .tres Konfiguration pro Effekttyp)
│   └── attack_behaviors/       (NEU – .tres pro AttackBehavior-Instanz,
│                                falls parametrisiert – sonst reichen
│                                die Skript-Ressourcen direkt)
├── assets/
│   ├── backgrounds/            (NEU – Level-Hintergrundbilder)
│   ├── sprites/
│   │   ├── enemies/            (Gegner-Sprites, Walk-/Death-Sheets,
│   │   │                        Shadows)
│   │   ├── towers/             (Turm-Sprites, Fire-Sheets, Icons)
│   │   ├── environment/        (bestehend – Boden-/Pfad-Kacheln)
│   │   ├── projectiles/        (NEU – bisher nur Polygon2D-Platzhalter)
│   │   ├── effects/            (NEU – ganze Kategorie neu, siehe
│   │   │                        Abschnitt 8)
│   │   ├── buildspots/         (NEU – Hover-/Selected-Overlays)
│   │   └── ui/
│   │       ├── icons/          (NEU – Turm-Icons, Gold-/Herz-Icons)
│   │       └── elements/       (NEU – Panels, Buttons, Rahmen)
│   ├── audio/                  (bereits vorgesehen, noch leer)
│   └── fonts/                  (bereits vorgesehen, noch leer)
├── shaders/                    (Wind-Sway,
│                                hit_flash.gdshader (NEU, Abschnitt 8.4))
└── docs/
    ├── asset_pakete/           (NEU – ein .md-Dokument pro Asset-Paket)
    ├── GDD_Jungle_Tower_Defense.md
    ├── Architektur_Jungle_Tower_Defense.md
    ├── Asset_Animation_Architektur_v1.md   (dieses Dokument)
    ├── StyleGuide_Jungle_Tower_Defense.md
    └── Prompt_Baukasten_Assets.md
```

**`docs/asset_pakete/`** ist der zentrale Ablageort für alle
Asset-Paket-Dokumente (siehe Abschnitt 6). Ein Paket = eine Datei.
Dateiname: `asset_paket_<entity>_lvl<n>.md`, z. B.
`asset_paket_bogenschuetzen_nest_lvl1.md`.

---

## 5. Asset-Paket-Regel (Entity vs. Nicht-Entity)

Nicht jedes Asset braucht ein eigenes Planungsdokument. Die Regel:

**Ein Asset-Paket-Dokument ist Pflicht für:**
- Alle **Entities** – d. h. alles, was im Spiel eigenständig agiert:
  - Türme (jede Ausbaustufe eigenes Paket, `lvl1` / `lvl2` / `lvl3`)
  - Gegnertypen
  - Helden
  - Bosse
  - Projektile mit sichtbaren Anbauteilen oder Effekten

Grund: Diese Objekte bestehen nie aus nur einem Bild. Ein Turm ist
`idle + fire + muzzle flash + projectile + impact + icon`. Ein Gegner ist
`walk + hit + death + shadow`. Wenn du das als "ein Auftrag" behandelst,
fehlt später garantiert etwas.

**Direkt (ohne Paket-Dokument) laufen:**
- Level-Hintergründe (ein PNG)
- UI-Icons und UI-Elemente (Rahmen, Buttons, Panels)
- Statische Deko-Props (einzelner Fels, einzelnes Zelt fürs Feldlager)
- Fonts, Shader
- Bauplatz-Overlays (Hover, Selected)

Grund: Diese Assets sind selbst schon "atomar" – ein Bild reicht,
keine Sonderintegration nötig.

**Zweifelsfall-Regel:** Wenn nicht klar ist, ob etwas ein Paket braucht,
dann ist die Antwort "ja". Lieber ein 5-Zeilen-Paket-Dokument zu viel als
ein Sonderfall im Code, den in drei Wochen niemand mehr versteht.

---

## 6. Asset-Paket-Vorlage

Jedes Asset-Paket-Dokument in `docs/asset_pakete/` folgt derselben Struktur.
Diese Vorlage ist verbindlich.

```markdown
# Asset-Paket: <Entity-Name> Level <n>

**Status:** <Entwurf | Prompts fertig | Bilder generiert | Integriert | Fertig>
**Zuständiger Chat-Kontext:** <Verweis auf den ChatGPT-Image-Chat, in dem
gearbeitet wird – Style-Anker-Regel!>

## 0. Preflight-Check vor Finalisierung

Pflicht, bevor dieses Dokument als fertig gilt (siehe Abschnitt 14, Regel 9):

- [ ] Aktuelle `Asset_Animation_Architektur_v1.md` geprüft
- [ ] Relevante Base-Skripte geprüft
- [ ] Relevante Config-/Resource-Skripte geprüft
- [ ] Alle Feldnamen im Integrationsauftrag entsprechen dem aktuellen Code
      oder werden im Auftrag explizit neu angelegt
- [ ] Keine alten Architekturbegriffe verwendet, die im aktuellen
      Projektstand nicht mehr gelten
- [ ] Keine Referenz auf nicht existierende Szenen wie z. B.
      `TowerBase.tscn`, falls diese nicht wirklich existieren
- [ ] Unklare Punkte sind als „Claude Code prüfen / nachfragen" markiert,
      nicht geraten

## 1. Bestandteile des Pakets

Liste aller Bilddateien, die zu diesem Entity gehören, mit Ziel-Dateinamen
und Ziel-Ordner.

| Bestandteil | Dateiname | Ordner | Status |
|---|---|---|---|
| ... | ... | ... | ... |

## 2. ChatGPT-Image-Prompts

Pro Bestandteil ein eigener Prompt, basierend auf `Prompt_Baukasten_Assets.md`.
Prompts werden im **selben** ChatGPT-Image-Chat abgearbeitet.

### Prompt 1: <Bestandteil>
<Der vollständige Prompt>

### Prompt 2: <Bestandteil>
<Der vollständige Prompt>

## 3. QA-Checkliste (pro Bild)

- [ ] Perspektive korrekt (Top-Down, leicht isometrisch)
- [ ] Stil-Anker gehalten (Cel-Shading, keine realistischen Details)
- [ ] Farbpalette aus StyleGuide (siehe Kernpalette)
- [ ] Alpha-Kanal echt (Photopea-Freistellung erfolgt)
- [ ] Sprite-Sheet-Frames bodenbündig (falls animiert)
- [ ] Pivot-Punkt korrekt (siehe Abschnitt 10)

## 4. Godot-Integration

Genauer Auftrag an Claude Code:
- Welche `.tres`-Datei muss angelegt/aktualisiert werden?
- Welche `.tscn`-Szene muss angepasst werden?
- Welche Config-Felder werden gesetzt?
- Welcher Test bestätigt die Integration?

## 5. Definition of Done

Siehe Abschnitt 11 dieses Dokuments. Konkret für dieses Paket erfüllt,
wenn:
- [ ] Alle Bestandteile aus Abschnitt 1 existieren am richtigen Ort
- [ ] Alle QA-Punkte pro Bild abgehakt
- [ ] Godot-Integration nach manuellem Test-Checklist grün
- [ ] Committet und gepusht (deutsche Commit-Message)
```

---

### 6.1 Turm-Paket: welche Bestandteile Pflicht sind

**Grundprinzip: Türme sind zweiteilig aufgebaut.** Der **Sockel** bleibt
zur Kamera hin fest ausgerichtet – das ist die Regel aus dem StyleGuide
("Türme sind zur Kamera ausgerichtet, nicht frei drehbar") und sichert
die Perspektiven-Konsistenz. Der **Turret** (Oberteil / Waffe) rotiert
kontinuierlich zum aktuellen Ziel und liefert das Kingdom-Rush-typische
Feedback, dass der Turm den Gegner aktiv verfolgt.

**Für jedes Level eines Turms (lvl1 / lvl2 / lvl3) sind Pflicht:**

- **`tower_<name>_lvl<n>_base.png`** – Sockelbild, statisch, zur Kamera
  ausgerichtet. Umfasst alles vom Boden bis zur Drehachse des Turrets
  (Fundament, Sandsäcke, Plattform, ggf. sitzender/stehender Bediener,
  falls dieser sich nicht mitdreht).
- **`tower_<name>_lvl<n>_turret.png`** – Turret-/Waffenbild, wird um seinen
  Pivot-Punkt rotiert. Umfasst die Waffe und alles, was sich zum Ziel
  ausrichten soll. **Erstellt in Blickrichtung rechts (0°)** – die
  Rotationslogik im Code rechnet von dieser Referenzrichtung aus.
- **`tower_<name>_lvl<n>_icon.png`** – 128×128 UI-Icon für BuildMenu
  (kann später ergänzt werden, aber im Paket-Dokument bereits vermerkt).

**Für jedes Level eines Turms optional (aber empfohlen):**

- **`tower_<name>_lvl<n>_turret_fire_sheet.png`** – 2-3 Frames
  Recoil-Animation des Turrets beim Schuss (Waffe zuckt zurück, Rauch
  am Lauf). Ersetzt beim Schuss kurzzeitig das statische Turret-Bild.
- **Zugehöriges Muzzle-Effect** – z. B.
  `effect_muendungsfeuer_klein_sheet.png` (kann von mehreren Türmen
  geteilt werden). Wird an der Mündung des Turrets gespawnt und **erbt
  die aktuelle Turret-Rotation**, damit das Feuer aus dem Lauf kommt und
  nicht daneben.
- **Zugehöriges Projektil** – z. B. `projectile_kugel.png` (Turm-Config
  verweist auf `ProjectileBase`-Szene). Startposition ist der
  Mündungspunkt, Flugrichtung folgt der Turret-Ausrichtung.
- **Zugehöriges Impact-Effect** – z. B.
  `effect_kugel_einschlag_sheet.png`.

**Opt-out für Sondertürme:** Nicht jeder Turm hat eine sinnvolle
Rotation. In diesen Fällen wird in der `TowerConfig` das Flag
`turret_rotation_enabled = false` gesetzt und `turret.png` kann leer
bleiben (dann ist der ganze Turm ein einzelnes statisches Bild in
`base.png`, wie bei den bestehenden Legacy-Configs). Bekannte Fälle:

- **Mörser / Artillerie** – schießen im hohen Bogen nach oben, keine
  horizontale Ausrichtung zum Ziel.
- **Tarn-Falle** – ist im Boden versteckt, keine sichtbare Waffe zum
  Drehen.
- **Dornen-Kaserne** (aktuelle AoE-Interimslösung) – bleibt bis zum
  echten Blocker-Einheiten-System auf Opt-out.

Das Opt-out muss im Paket-Dokument explizit begründet werden – nicht
"vergessen zu setzen", sondern bewusste Design-Entscheidung.

**Regel:** Auch wenn Muzzle-Effect, Projektil und Impact-Effect zwischen
mehreren Türmen geteilt werden, gehören sie im Paket-Dokument aufgelistet
(mit Vermerk "geteilt mit X"), damit klar ist, wovon dieser Turm abhängt.

### 6.2 Gegner-Paket: welche Bestandteile Pflicht sind

Für **jeden Gegnertyp** sind Pflicht:

- **`enemy_<name>_walk_sheet.png`** – 3-Frame Walk-Loop (Stufe-1-Animation
  gemäß GDD 6, bewusste Entscheidung)
- **`enemy_<name>_death_sheet.png`** – 3-5 Frames Todes-Animation
  (umfallen / verpuffen / je nach Charakter)
- **`enemy_<name>_shadow.png`** – ovaler weicher Schatten unter den Füßen
  (kann für mehrere humanoide Gegner geteilt werden)

Für **jeden Gegnertyp** optional:

- **Hit-Flash** – kein Bild, sondern ein Shader-Effekt (siehe Abschnitt 8),
  wird per Turm-Treffer ausgelöst
- **Status-Overlay** – für Gift (Neongrün-Tint) etc., wenn Gegner
  entsprechende Effekte tragen kann

---

## 7. Animation-State-Machines

State Machines sind der Unterschied zwischen "Sprite bewegt sich" und
"Charakter reagiert auf Ereignisse". Ohne sie führt jedes Feature zu
Sonderregeln direkt in `_physics_process()`. Mit ihnen bleibt der
Basisklassen-Code kurz und die Erweiterung offen.

### 7.1 Gegner-States

Verbindliche States für den MVP:

```
enum EnemyState {
    WALK,        # Standard: läuft am Pfad entlang
    HIT_FLASH,   # kurzer weißer Blink bei Trefferschaden (150–200ms)
    DEATH,       # Todes-Animation läuft ab, danach queue_free
}
```

**Übergangsregeln:**
- Start: `WALK`
- `take_damage()` → `HIT_FLASH` für kurze Dauer, danach zurück zu `WALK`
  (falls hp > 0)
- hp erreicht ≤ 0 → `DEATH` (irreversibel)
- `_path_follow.progress_ratio >= 1.0` → sofortiges Entfernen
  (Zielankunft, keine Death-Animation)

**Wichtig:** `WALK` bleibt der Default und darf jederzeit von `HIT_FLASH`
kurz überschrieben werden, ohne dass die Wegbewegung aussetzt. `HIT_FLASH`
ist ein rein visueller Overlay-Zustand.

`STUNNED` / `SLOWED` / `BURNING` sind explizit **nicht** im MVP-Scope,
werden aber im State-Machine-Design so vorbereitet, dass sie später ohne
Refactor ergänzbar sind (siehe Post-MVP-Liste in Abschnitt 13).

### 7.2 Turm-States

Verbindliche States für den MVP:

```
enum TowerState {
    IDLE,       # kein Ziel in Reichweite, wartet
    ACQUIRING,  # Ziel gefunden, dreht sich / zielt (falls animiert)
    FIRE,       # Schuss-Animation läuft, Projektil wird gespawnt
    COOLDOWN,   # zwischen zwei Schüssen (aktueller FireTimer)
}
```

**Übergangsregeln:**
- Start: `IDLE` – Turret ruht in Referenzrichtung (0°), keine Zielsuche
  aktiv oder nichts in Reichweite.
- Ziel in Reichweite gefunden → `ACQUIRING`. Der Turret rotiert
  kontinuierlich pro Frame zur Position des aktuellen Ziels
  (`_process(delta)` in `TowerBase` mit `lerp_angle()` oder ähnlichem,
  Winkelgeschwindigkeit konfigurierbar via `TowerConfig.turret_rotation_speed`
  in rad/s). Sobald die Ausrichtung eine Toleranz-Schwelle unterschreitet
  (z. B. < 5°) und der FireTimer bereit ist → `FIRE`.
- FireTimer-Timeout **und** Turret ist ausgerichtet → `FIRE` (Schuss +
  Muzzle-Effekt spawnen, Turret spielt Fire-Sheet ab falls vorhanden).
- Nach `FIRE`-Animation → `COOLDOWN`. Turret verfolgt in dieser Phase
  weiter das Ziel (visuell aktiv), feuert aber nicht.
- FireTimer läuft ab → `IDLE` (Ziel verloren) oder direkt zurück nach
  `ACQUIRING` bzw. `FIRE`, je nach Zielverfügbarkeit und aktueller
  Ausrichtung.

**Für Türme mit `turret_rotation_enabled = false`** (siehe Section 6.1,
Opt-out) entfällt der `ACQUIRING`-Zwischenschritt vollständig. Sobald ein
Ziel gefunden ist und der FireTimer bereit ist, geht der Turm direkt in
`FIRE`. Praktisch: `IDLE ↔ FIRE ↔ COOLDOWN`. Diese Vereinfachung ist die
gewollte Fallback-Route für Mörser, Tarn-Fallen und die Dornen-Kaserne
(Interimslösung).

---

## 8. Effekt-System

**Aktueller Stand:** `ProjectileBase._spawn_hit_effect()` erzeugt eine
inline `CPUParticles2D`-Wolke. Das ist ein Einzelfall und keine echte
Kategorie.

**Ziel-Zustand:** Effekte sind eine erste Klasse Bürger im Projekt, mit
eigener Basisszene, eigener Resource-Klasse und einheitlichem
Spawn/Despawn-Verhalten.

### 8.1 EffectBase

Neue Basisszene: `scenes/effects/EffectBase.tscn` mit Skript
`scripts/entities/EffectBase.gd`.

Aufbau:
```
EffectBase (Node2D)
├── AnimatedSprite2D    (für Frame-basierte Effekte)
└── AutoFreeTimer       (zerstört Node nach Animation)
```

Verantwortlichkeiten:
- Wird an einer Weltposition gespawnt (z. B. Mündung, Einschlagspunkt)
- Spielt seine Animation genau einmal ab
- Entfernt sich danach selbst via `queue_free()`
- Referenziert eine `EffectConfig`-Resource für Frames, Geschwindigkeit,
  Skalierung

### 8.2 EffectConfig-Resource

Neue Resource-Klasse: `scripts/resources/EffectConfig.gd`.

Felder:
```gdscript
extends Resource
class_name EffectConfig

@export var sprite_frames: SpriteFrames
@export var animation_name: String = "play"
@export var scale: Vector2 = Vector2.ONE
@export var z_index: int = 0
```

Konkrete Effekte sind dann einfach `.tres`-Dateien:
- `resources/effects/muendungsfeuer_klein.tres`
- `resources/effects/pfeil_einschlag.tres`

### 8.3 Wer spawnt Effekte?

- **Muzzle-Effekt** wird vom Turm gespawnt, sobald geschossen wird
  (`TowerConfig` bekommt ein datengetriebenes Feld
  `muzzle_effect_config: EffectConfig`; `TowerBase` oder die aktive
  `AttackBehavior` spawnt daraus eine `EffectBase`-Instanz an
  `get_muzzle_global_position()`. Kein Mündungsfeuer wird hart im Code
  verdrahtet.)
- **Impact-Effekt** wird vom Projektil gespawnt beim Aufprall
  (`ProjectileBase` bekommt ein datengetriebenes Feld
  `impact_effect_config: EffectConfig`; `_impact()` spawnt daraus eine
  `EffectBase`-Instanz. Die aktuelle inline-`CPUParticles2D`-Lösung
  wird dadurch ersetzt. Kein Impact-Effekt wird hart im Code verdrahtet.)
- **Death-Effekt** (Explosion, Rauch) wird vom Gegner in seiner
  `DEATH`-State gespawnt
- **Hit-Flash** ist **kein** Effekt in diesem Sinne, sondern ein Shader
  auf dem Gegner selbst (siehe 8.4)

### 8.4 Hit-Flash-Shader

Kein neues Asset nötig. Ein einfacher `ShaderMaterial` auf dem
`AnimatedSprite2D` des Gegners, der die Sprite-Farbe kurzzeitig auf Weiß
zieht. Wird in `EnemyBase.take_damage()` per Uniform aktiviert und nach
kurzer Zeit (150-200ms) wieder deaktiviert.

Ort: `shaders/hit_flash.gdshader` (neu).

---

## 9. Komponenten-Architektur für Türme (AttackBehavior)

**Aktueller Code (`TowerBase._on_fire_timer_timeout()`):**

```gdscript
if config.is_aoe:
    _fire_aoe()
else:
    _fire_single()
```

Zwei Angriffsarten, ein Bool-Flag – funktioniert. Wird zum Problem, sobald
Angriffsart Nr. 3, 4, 5 hinzukommen (Flammenwerfer-Kegel,
Artillerie-Arc-Wurf, Tesla-Kettenblitz, Slow-Aura, Tarn-Falle-Trigger).

Die Entscheidung ist gefallen: wir bauen es **jetzt** um, nicht später.
Gründe: (a) Die Post-MVP-Türme aus GDD 5.5 sind konkret geplant und
brauchen alle andere Angriffsarten, (b) späterer Refactor betrifft dann
schon 3+ produktive Türme, jetziger Refactor betrifft nur 3
Platzhalter-Configs, (c) `TowerConfig` sauber halten von der Beginn.

### 9.1 Struktur

Neuer Ordner: `scripts/entities/attack_behaviors/`

Basisklasse: `AttackBehavior.gd`
```gdscript
extends Resource
class_name AttackBehavior

## Fuehrt einen Angriff aus. tower_context ist der aufrufende Turm und
## enthaelt Position, Config, Zugriff auf Effekte usw.
func fire(tower_context: TowerBase) -> void:
    push_error("AttackBehavior.fire() muss ueberschrieben werden")
```

Erste konkrete Implementierungen:
- `SingleTargetAttack.gd` – aktueller `_fire_single`-Code, inkl.
  Projektil-Spawn
- `AoEAttack.gd` – aktueller `_fire_aoe`-Code

Später (Post-MVP):
- `ConeAttack.gd` – Kegel-Angriff für Flammenwerfer
- `ArcProjectileAttack.gd` – Arc-Wurf für Artillerie
- `ChainLightningAttack.gd` – Kettenblitz für Tesla
- `AuraAttack.gd` – passive Effekte in Reichweite (Slow, Buff)

### 9.2 TowerConfig-Anpassung

Aktuell:
```gdscript
@export var is_aoe: bool = false
```

Neu:
```gdscript
@export var attack_behavior: AttackBehavior
@export var muzzle_effect_config: EffectConfig
@export var impact_effect_config: EffectConfig
```

`is_aoe`, `dot_damage_per_tick`, `dot_tick_interval`, `dot_duration`
werden **nicht** entfernt – sie bleiben als Parameter der jeweiligen
`AttackBehavior` erhalten. `AoEAttack` z. B. liest sie direkt aus
`tower_context.config`.

### 9.3 Migration der bestehenden Configs

Nach der Entscheidung, das Bogenschützen-Nest stilistisch abzulösen, aber
bis zur erfolgreichen MG-Turm-Integration spielbar im Projekt zu behalten,
werden zur Migration ausdrücklich **alle bestehenden Turm-Configs**
berücksichtigt:

- `bogenschuetzen_nest.tres` → bleibt temporärer Legacy-Starter-Turm,
  bekommt `attack_behavior: SingleTargetAttack`, bleibt als monolithisches
  `base_texture` mit `turret_rotation_enabled = false` erhalten und wird
  erst nach erfolgreicher MG-Turm-Integration in einem separaten
  Cleanup-Auftrag entfernt.
- `dornen_kaserne.tres` → bekommt `attack_behavior: AoEAttack` (Nahkampf-
  Interimslösung gemäß GDD; bleibt außerdem auf
  `turret_rotation_enabled = false`).
- `giftschleuder.tres` → bekommt `attack_behavior: AoEAttack` mit
  Gift-DoT-Konfiguration.

Der neue **MG-Turm** (`mg_turm.tres`, siehe Ausblick Section 15) wird als
erster Turm nach der neuen Architektur produziert: `SingleTargetAttack`
+ `turret_rotation_enabled = true` + separates Base/Turret-Sprite-Paar.
Er ist damit der Referenz-Turm für alle weiteren Turmproduktionen.

### 9.4 TowerBase-Vereinfachung

`TowerBase._on_fire_timer_timeout()` reduziert sich auf:

```gdscript
func _on_fire_timer_timeout() -> void:
    if config.attack_behavior:
        config.attack_behavior.fire(self)
```

`_fire_single`, `_fire_aoe`, `_fire_projectile`, `_apply_hit` wandern in
die jeweiligen `AttackBehavior`-Subklassen. `_find_target()` bleibt in
`TowerBase`, weil Zielsuche eine gemeinsame Turmlogik ist – die
`AttackBehavior`s rufen sie über den `tower_context` auf.

### 9.5 Testkriterium für den Refactor

Nach dem Umbau muss das Spiel **exakt identisch** aussehen und sich
verhalten. Der Refactor ist ein reiner Struktur-Umbau ohne Verhaltens-
änderung. Test: alle bisherigen Wellen des Prototype-Levels durchspielen,
Turm platzieren/verkaufen, Game-Over und Victory-Screen erreichen. Wenn
irgendetwas sich anders anfühlt, ist der Refactor fehlerhaft.

---

## 10. Pivot-Regeln

Falsche Pivot-Punkte führen zu sichtbarem "Rutschen" oder "Schweben" bei
der Animation und wirken sofort billig. Deshalb strikte Regel pro
Kategorie.

| Kategorie | Pivot |
|---|---|
| Gegner (AnimatedSprite2D) | **Unten-Mitte** (Fußreferenzpunkt) – Node2D-Ursprung sitzt am Boden, Sprite wird nach oben gezeichnet |
| Turm-Sockel (`base`-Sprite) | **Unten-Mitte** des Sockels – so sitzt der Turm sauber im Bauplatz-Ring |
| Turm-Turret (`turret`-Sprite) | **Drehachse der Waffe** – dort wo die Waffe visuell rotieren würde (meist Waffenmittelpunkt, nicht Mündung). Turret wird als Kindknoten des Sockels positioniert; sein lokaler (0,0) liegt auf dieser Drehachse. Mündungspunkt für Muzzle-Spawn wird separat als Marker-Node im Turret gesetzt. |
| Projektile | **Zentrum** – Rotation um den Mittelpunkt |
| Effekte | **Zentrum bzw. Einschlagspunkt** – abhängig vom Effekt-Typ, dokumentiert in `EffectConfig` |
| Level-Hintergrund | Oben-Links, Position (0, 0) |
| UI-Icons | Zentrum |
| Bauplatz-Overlays | Zentrum – sitzt auf dem Slot-Node |

Beim Erstellen von Sprite-Sheets in ChatGPT Image und beim Zuschneiden in
Photopea muss die Pivot-Regel jeweils berücksichtigt werden. Bei Gegnern
insbesondere: alle Walk-Frames werden auf den Fuß-Referenzpunkt
ausgerichtet ("bodenbündig"), nicht einfach in gleiche Bildstreifen
geschnitten. Diese Regel ist bereits im
`Prompt_Baukasten_Assets.md` dokumentiert – sie gilt für alle animierten
Einheiten, nicht nur für den Späher.

---

## 11. Definition of Done (pro Asset-Paket)

Ein Asset-Paket ist erst dann "fertig", wenn alle folgenden Kriterien
erfüllt sind:

**Auf Asset-Seite (pro Bild):**
- Datei existiert am korrekten Ort mit korrektem Namen (siehe Abschnitt 3)
- Alpha-Kanal ist echt (Photopea-Test bestanden, kein Fake-Karo)
- Perspektive und Stil entsprechen `StyleGuide_Jungle_Tower_Defense.md`
- Farben aus der verbindlichen Kernpalette
- Bei Sprite-Sheets: Frames bodenbündig ausgerichtet, gleiche Framehöhe
- Pivot-Regel gemäß Abschnitt 10 eingehalten

**Auf Integrations-Seite:**
- Zugehörige `.tres`-Config existiert und ist mit korrekten Werten befüllt
- Zugehörige `.tscn`-Szene lädt die Config und referenziert die
  Sprite-Datei
- Falls Animation: `SpriteFrames`-Resource in der Szene korrekt konfiguriert
  (Frame-Regionen, Loop, Speed)
- Falls Effekt: `EffectConfig`-Resource existiert, Test-Spawn funktioniert
- Falls Turm mit `AttackBehavior`: die Behavior-Ressource ist in der
  Turm-Config gesetzt und funktioniert

**Auf Test-Seite:**
- Manueller Test in Godot durchgeführt und dokumentiert:
  - Bei Gegnern: läuft am Pfad, nimmt Schaden, spielt Death-Animation,
    Reward wird gutgeschrieben
  - Bei Türmen: erkennt Gegner, spielt Fire-Animation, spawnt
    Muzzle-Effekt, spawnt Projektil, Projektil spawnt Impact-Effekt,
    Gegner nimmt Schaden
  - Bei Effekten: spawnen an korrekter Position, spielen einmal ab,
    entfernen sich sauber (keine Leichen im Szenengraph)

**Auf Prozess-Seite:**
- Alles committet und mit deutscher Commit-Message zu GitHub gepusht
  (siehe CLAUDE.md-Regel)
- Paket-Dokument in `docs/asset_pakete/` auf Status "Fertig" gesetzt
- STATUS.md aktualisiert (kurzer Eintrag, welches Paket abgeschlossen ist)

---

## 12. Die Pipeline: wie ein Asset-Paket entsteht

Verbindlicher Ablauf für jedes neue Asset-Paket. Nicht überspringen, auch
nicht bei kleinen Paketen.

**Schritt 1 – Paket-Planung (Finn ↔ Claude Chat)**
Finn nennt das Ziel-Entity ("Bogenschützen-Nest Level 1"). Claude Chat
schreibt das Paket-Dokument gemäß Vorlage aus Abschnitt 6: welche Bilder,
welche Dateinamen, welche Prompts, welche Integration. Ergebnis liegt in
`docs/asset_pakete/`.

**Schritt 2 – Bilder generieren (Finn ↔ ChatGPT Image)**
Finn arbeitet die Prompts aus dem Paket-Dokument **einzeln und in
Reihenfolge** ab, **im selben ChatGPT-Image-Chat**. Style-Anker-Regel!
Ein neuer Chat startet ohne den bisherigen Bildverlauf und driftet vom
Stil ab. Nach jedem Bild kurze Sichtprüfung anhand der QA-Checkliste.

**Schritt 3 – Nachbearbeitung (Finn ↔ Photopea)**
Jedes Bild durchläuft Photopea: Hintergrund freistellen (echter
Alpha-Kanal), bei Sprite-Sheets Frames bodenbündig zuschneiden und
zusammensetzen. PNG-Export. Ablage im richtigen Zielordner mit korrektem
Namen.

**Schritt 4 – QA-Sichtprüfung (Finn ↔ Claude Chat)**
Finn zeigt Claude Chat die fertigen Bilder. Claude prüft gegen die
QA-Checkliste. Bei Beanstandungen: zurück zu Schritt 2 (im selben Chat!)
mit gezieltem Nachbesserungs-Prompt.

**Schritt 5 – Integration-Auftrag (Claude Chat → Claude Code)**
Claude Chat schreibt den Goal-Auftrag basierend auf Abschnitt 4 des
Paket-Dokuments und übergibt ihn an Claude Code. Enthält: exakte
Dateinamen, welche `.tres` anzulegen/zu ändern, welche `.tscn` anzupassen,
welcher Testfall gilt.

**Schritt 6 – Integration (Claude Code)**
Claude Code setzt den Auftrag um. Verwendet dabei keine anderen
Dateinamen als im Paket-Dokument steht. Bei Widersprüchen zwischen Paket
und Ist-Zustand: nachfragen, nicht raten (CLAUDE.md-Regel).

**Schritt 7 – Manueller Test (Finn)**
Finn testet in Godot gegen die Test-Checkliste aus dem Paket-Dokument.

**Schritt 8 – Commit & Push (Claude Code)**
Deutsche Commit-Message, Push auf GitHub. Kein Auftrag ist fertig, bevor
gepusht wurde (CLAUDE.md-Regel).

**Schritt 9 – Sync & Abschluss (Finn ↔ Claude Chat)**
Finn triggert im Claude-Projekt einmal "Projekt neu synchronisieren",
damit der neueste Stand in meinen Kontext kommt. Paket-Dokument wird auf
"Fertig" gesetzt, STATUS.md aktualisiert.

---

## 13. Was ausdrücklich NICHT jetzt gebaut wird

Wichtig, damit spätere Sessions nicht doch heimlich anfangen:

**Nicht jetzt – erst Polish-Phase (Schritt 7 im Ablaufplan):**
- Skelett-Animation via `Skeleton2D` / `AnimationPlayer`. Stufe 1 bleibt
  3-Frame-Ganzkörper-Sprite-Sheets für alle Gegner, egal wie humanoid
  sie sind. Grund: ChatGPT-Image-Fehleranfälligkeit steigt exponentiell
  mit der Framezahl im selben Prompt, und die Entwicklungsgeschwindigkeit
  ist wichtiger als AAA-Charakteranimation. Entscheidung dokumentiert in
  GDD 6 und STATUS.md.
- Erweiterte Gegner-States: `STUNNED`, `SLOWED`, `BURNING`. State-Machine
  bereitet die Erweiterbarkeit vor, aber die States werden erst
  implementiert, wenn ein Turm sie tatsächlich auslöst.
- Achtwege-Richtungsanimation für Gegner. MVP bleibt bei zwei Richtungen
  (via `flip_h`).

**Nicht jetzt – erst wenn konkret gebraucht:**
- 3D-Modelle, echtes 3D-Rendering. Das Projekt ist und bleibt 2D
  (Perspektive top-down leicht isometrisch).
- Base-Building-Systeme im Stil von Clash of Clans. Das ist ein anderes
  Genre. Unser Spiel ist Tower Defense mit festem Pfad – Ende der
  Diskussion.
- `EnemyAnimationState`-Editor-Werkzeuge oder ein "Skill-Tree-Editor" für
  Türme. Overengineering. Wenn Balancing über `.tres` schnell genug
  läuft, brauchen wir keinen Editor.
- Ausgefeilte UI-Themen, Fonts, Sound. Kommt in Polish-Phase.

**Nicht jetzt – bewusst verschoben:**
- Dornen-Kaserne als echtes Blocker-Einheiten-System (aktuell AoE-Platzhalter
  – Entscheidung dokumentiert in `Architektur_Jungle_Tower_Defense.md`
  Abschnitt 10).
- Held ("Dschungel-Wächter") mit aktiver Fähigkeit. Der Vertical Slice
  fokussiert vorerst weiter auf Turm-Gegner-Loop. Held wird nach
  abgeschlossenem Bogenschützen-Nest-Paket und Dschungel-Späher-Paket
  angegangen.

---

## 14. Verbindliche Regeln für Claude Code (Ergänzung)

Zusätzlich zu den Regeln in `Architektur_Jungle_Tower_Defense.md` Abschnitt 11
und den `CLAUDE.md`-Regeln gelten ab jetzt:

1. **Kein Entity-Asset ohne Paket-Dokument.** Wenn ein Auftrag für einen
   neuen Turm/Gegner/Held/Boss reinkommt und kein
   `docs/asset_pakete/asset_paket_*.md` existiert, wird der Auftrag
   abgelehnt mit dem Hinweis "Paket-Dokument fehlt".

2. **Keine erfundenen Dateinamen.** Wenn ein Paket-Dokument existiert,
   werden ausschließlich die dort gelisteten Dateinamen verwendet. Keine
   Umbenennung, keine Abkürzung, keine Anglifizierung ("archer_tower"
   statt "bogenschuetzen_nest").

3. **Kein hartcodierter `preload()`-Pfad zu Asset-Dateien in
   Gameplay-Logik.** Alle Asset-Referenzen laufen über `.tres`-Configs
   (`TowerConfig.texture`, `EffectConfig.sprite_frames`) oder über
   `@export`-Felder in `.tscn`-Szenen. Ausnahmen nur, wenn explizit im
   Paket-Dokument dokumentiert.

4. **Effekte spawnen ausschließlich über `EffectBase`.** Kein direkter
   `CPUParticles2D.new()` in Turm-/Projektil-Code mehr. Sobald das
   `EffectBase`-System steht, wird die aktuelle Inline-Lösung in
   `ProjectileBase._spawn_hit_effect()` migriert.

5. **Neue Angriffsart = neue `AttackBehavior`-Subklasse.** Kein neuer
   `if config.some_flag: ...`-Zweig in `TowerBase`. Wenn ein Turm eine
   Angriffsart braucht, die noch nicht existiert: erst `AttackBehavior`
   erweitern, dann Turm-Config füllen.

6. **State-Machine-Übergänge sind zentral.** `EnemyBase` und `TowerBase`
   haben je genau eine Methode für State-Wechsel (`_set_state(new_state)`).
   Keine ad-hoc `if _is_dead: return`-Konstruktionen quer durch den Code
   verstreuen. Wenn ein State-Wechsel nicht klappt, wird die
   State-Machine erweitert, nicht der Kontroll-Flow "gepatcht".

7. **Deutsche Commit-Messages und Push nach jedem Auftrag** bleibt
   unverändert Pflicht (CLAUDE.md).

8. **Türme werden ab v1.2 standardmäßig als Sockel + Turret gebaut.**
   `TowerBase` ist dabei **das gemeinsame Skript**, nicht zwingend eine
   eigene Basisszene. Jede konkrete Turm-Szene enthält standardmäßig die
   Node-Struktur `Base` (Sprite2D, statisch), `Turret` (Node2D, rotierbar),
   `TurretSprite`, `MuzzlePoint`, `DetectionArea` und `FireTimer`.
   `TowerConfig` trägt separate Felder `base_texture`, `turret_texture`,
   `turret_rotation_enabled: bool`, `turret_rotation_speed: float`,
   `attack_behavior`, `muzzle_effect_config` und `impact_effect_config`.
   Türme ohne sinnvolle Rotation setzen `turret_rotation_enabled = false`
   und dürfen `turret_texture` leer lassen – dann ist der Turm optisch
   ein einzelnes Bild aus `base_texture`. Das Opt-out muss im
   Paket-Dokument des Turms mit einer Begründung dokumentiert werden.
   **Keine neuen Türme mehr als monolithischer Einzelsprite ohne
   dokumentiertes Opt-out.**

9. **Preflight-Check vor jedem Asset-Paket- und Integrationsauftrag ist
   Pflicht.** Claude muss vor Finalisierung des Dokuments die aktuelle
   `Asset_Animation_Architektur_v1.md`, die relevanten Base-Skripte und
   die relevanten Config-Skripte gegenprüfen. Bei Türmen sind das
   mindestens `TowerBase.gd` und `TowerConfig.gd`, bei Gegnern
   `EnemyBase.gd` und `EnemyConfig.gd`, bei Effekten `EffectBase.gd` und
   `EffectConfig.gd`. Integrationsaufträge dürfen nur Feldnamen,
   Szenenstrukturen und Dateipfade verwenden, die im aktuellen
   Projektstand wirklich existieren oder im selben Auftrag ausdrücklich
   neu angelegt werden. Hypothetische Feldnamen sind verboten. Wenn ein
   Feld oder eine Struktur unklar ist, muss der Auftrag dies als
   Prüfpunkt markieren oder nachfragen – nicht raten.

---

## 15. Was als Nächstes ansteht (Ausblick)

Diese Doku ist die Grundlage. Der konkrete Umsetzungsplan (angepasst
für v1.2 nach der Entscheidung, das Bogenschützen-Nest stilistisch
abzulösen, aber bis zur erfolgreichen MG-Turm-Integration als funktionale
Legacy-Absicherung im Projekt zu behalten) sieht folgende Reihenfolge vor:

1. **Diese Doku (v1.2) wird approved.** Finn liest sie durch und sagt
   "ok" oder markiert Änderungswünsche.
2. **Dokumentations- und Status-Auftrag** an Claude Code: GDD und STATUS.md
   werden auf den neuen MVP-Fokus **MG-Turm** umgestellt. Das
   Bogenschützen-Nest wird als **deprecated Legacy-Starter-Turm** markiert,
   aber noch nicht gelöscht. So bleibt der Prototyp während des Refactors
   vollständig spielbar.
3. **TowerBase-Refactor kombiniert**: AttackBehavior-Komponenten +
   Sockel/Turret-Aufbau + Turret-Rotation in einem Zug, weil beides
   `TowerBase.gd` und `TowerConfig.gd` betrifft. Bogenschützen-Nest,
   Dornen-Kaserne und Giftschleuder werden technisch migriert (bekommen
   `AttackBehavior`, bleiben auf `turret_rotation_enabled = false` und
   monolithischem `base_texture` – Legacy-Zustand mit dokumentiertem
   Opt-out). Verhalten des Spiels muss identisch bleiben, sichtbar geändert
   wird nichts.
4. **Erstes Asset-Paket-Dokument:** `asset_paket_mg_turm_lvl1.md`
   (Sockel, Turret, Mündungsfeuer, Impact-Effekt, Projektil, optional
   Fire-Frame des Turrets, Icon). Prompt-für-Prompt-Ablauf gemäß
   Pipeline in Section 12.
5. **MG-Turm integrieren**: `.tres`, `.tscn`, HUD auf MG-Turm als neuen
   `starter_tower` umbiegen. Ab hier ist das Bogenschützen-Nest nicht mehr
   als funktionale Absicherung nötig. Der MG-Turm ist der erste Turm nach
   der neuen Architektur und wird zum Referenz-Muster für alle weiteren
   Turmproduktionen. Das Bogenschützen-Nest wird erst danach in einem
   separaten Cleanup-Auftrag entfernt, nicht im Refactor.
6. **Level-Hintergrund-Einbau** ← *"damit direkt mit einem
   funktionsfähigen Turm getestet werden kann"*, als eigenständiger
   Auftrag (`level_01_jungle_background.png`, präzise Path2D-Ausrichtung
   entlang des sichtbaren Pfads inkl. Fluss/Brücken-Übergänge, 8
   TowerSlot-Nodes an den sichtbaren Steinring-Positionen).
7. **Erstes Gegner-Paket-Dokument:** Erweiterung des Dschungel-Späher
   um `death_sheet`, `shadow`, Hit-Flash-Shader.
8. **Animation-State-Machine in `EnemyBase`** umsetzen
   (WALK/HIT_FLASH/DEATH).
9. **Balancing-Pass** – MG-Turm-Werte kalibrieren, Wellen-Schwierigkeit
   nachziehen.

Danach: erste Sichtbarkeitsprüfung des vollständigen "gefühlten"
Spielverlaufs. Erst wenn dieser Loop sich richtig anfühlt, wird der
zweite Turm/Gegner angegangen (Kandidaten: Raketenturm oder
Scharfschützen-Turm bei den Türmen; Wildschwein-Rammler bei den Gegnern,
wenn Legacy-Config aktiviert wird).

---

## Änderungshistorie

**v1.2 (08. Juli 2026):**
- Bogenschützen-Nest wird nicht mehr vor der MG-Turm-Integration gelöscht.
  Es bleibt temporär als deprecated Legacy-Starter-Turm erhalten, damit der
  Prototyp während des Refactors vollständig spielbar bleibt.
- Widerspruch zu `TowerBase.tscn` geklärt: `TowerBase` ist das gemeinsame
  Skript; jede konkrete Turm-Szene enthält die Standardstruktur
  `Base`/`Turret`/`MuzzlePoint`/`DetectionArea`/`FireTimer`.
- `TowerConfig` um datengetriebene Effekt-Felder
  `muzzle_effect_config` und `impact_effect_config` ergänzt, damit
  Mündungsfeuer und Einschlag nicht hart im Code verdrahtet werden.
- Migration der bestehenden Turm-Configs präzisiert: Bogenschützen-Nest,
  Dornen-Kaserne und Giftschleuder dürfen technisch migriert werden, auch
  wenn sie inhaltlich pausiert bzw. deprecated sind.
- Neue Regel Nr. 9 für Claude Code (Section 14): Preflight-Check vor jedem
  Asset-Paket- und Integrationsauftrag ist Pflicht (aktuelle Architektur-
  Doku, Base- und Config-Skripte gegenprüfen, keine hypothetischen
  Feldnamen). Grund: Im MG-Turm-Asset-Paket waren Altlasten aus früheren
  Architekturständen (`TowerBase.tscn`) und ungeprüfte Feldnamen
  aufgetaucht. Asset-Paket-Vorlage (Section 6) bekommt dafür einen neuen
  Pflichtabschnitt „0. Preflight-Check vor Finalisierung".

**v1.1 (07. Juli 2026):**
- Bogenschützen-Nest als erster Turm entfernt (stilistischer Bruch mit
  StyleGuide-Roster, das militärische Türme vorsieht). Ersetzt durch
  MG-Turm.
- Neuer verbindlicher Turm-Aufbau: Sockel (statisch, zur Kamera
  ausgerichtet) + Turret (rotiert zum Ziel). Opt-out via
  `turret_rotation_enabled = false` für Sondertürme (Mörser, Tarn-Falle,
  aktuelle Dornen-Kaserne).
- Turm-Paket-Bestandteile (Section 6.1) auf zweiteiligen Aufbau
  umgestellt: `base.png` + `turret.png` statt `idle.png`.
- Turm-State-Machine (Section 7.2) um konkrete Rotation-Semantik im
  `ACQUIRING`-State ergänzt.
- Pivot-Regeln (Section 10) um Turret-Drehachse und `MuzzlePoint`-Marker
  ergänzt.
- Neue Regel Nr. 8 für Claude Code (Section 14): Türme standardmäßig
  Sockel + Turret, monolithische Legacy-Einzelsprites nur mit
  dokumentiertem Opt-out.
- Ausblick (Section 15) Reihenfolge festgelegt: Aufräum-Auftrag →
  TowerBase-Refactor (AttackBehavior + Sockel/Turret) →
  Asset-Paket-Dokument → MG-Turm-Integration (ab hier ist das Spiel
  wieder vollständig spielbar) → Level-Hintergrund-Einbau (jetzt mit
  funktionsfähigem Turm testbar) → Gegner-Paket → Animation-State-Machine
  → Balancing-Pass.

**v1.0 (07. Juli 2026):**
- Erstversion des Dokuments. Etabliert Asset-Kategorien,
  Namenskonventionen, Asset-Paket-Regel (Entity vs. Nicht-Entity),
  Animation-State-Machines, Effekt-System, AttackBehavior-Komponenten,
  Pivot-Regeln, Definition of Done, Pipeline.
