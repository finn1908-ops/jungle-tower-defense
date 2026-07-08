# Blueprint: Schritte 2–6 zum funktionierenden Level-Hintergrund

**Status:** v1.0 – erstellt nach Approval von Asset_Animation_Architektur_v1.1
**Basis:** `docs/Asset_Animation_Architektur_v1.md` Section 15

---

## Wie du dieses Dokument nutzt

Jeder Schritt ist ein eigener Abschnitt mit vier Teilen:

1. **Wer macht was** – klare Rollenverteilung (Finn / Claude Chat / Claude
   Code / ChatGPT Image / Photopea)
2. **Prompt / Auftrag** – exakt der Text, den du weitergibst, ohne
   Nachbesserung
3. **Was danach getestet werden muss** – Checkliste, bevor du zum
   nächsten Schritt gehst
4. **Freigabe für nächsten Schritt** – die Bedingung, ab der du
   weitermachen darfst

**Iterations-Regel:** Wenn im Test etwas nicht funktioniert, gehst du
nicht weiter. Du kommst zurück in den Chat mit einer präzisen Fehler-
beschreibung (was du versucht hast + was passiert ist + welcher Test
gescheitert ist). Ich formuliere dann einen Fix-Auftrag. Erst nach
grünem Test geht's zum nächsten Schritt.

**Sync-Regel:** Nach jedem Schritt, den Claude Code ausgeführt hat (also
nach Schritt 2, 3, 5, 6) triggerst du im Claude-Projekt "Projekt neu
synchronisieren", **bevor** du hier den nächsten Auftrag holst. Sonst
arbeite ich mit einem veralteten Kontext.

---

## Schritt 2 – Aufräum-Auftrag: Bogenschützen-Nest raus

### Wer macht was

- **Claude Code** erledigt alle Datei-Änderungen, Löschungen, Commits
  und Push
- **Finn** testet das Ergebnis in Godot und triggert danach die
  Projekt-Sync

### Prompt für Claude Code

```
Aufraeum-Auftrag: Bogenschuetzen-Nest komplett aus dem Projekt entfernen.

Kontext: Nach der neuen Asset- und Animations-Architektur v1.1 wird das
Bogenschuetzen-Nest als erster Turm durch den MG-Turm ersetzt. Der
Bogenschuetzen-Nest-Turm passt stilistisch nicht zum militaerischen
Setting und wird komplett aus dem Repo entfernt, nicht als Legacy
behalten. Der MG-Turm folgt in einem spaeteren Auftrag.

Dieser Auftrag ist ein reiner Aufraeum- und Umbau-Auftrag. Es wird
kein neuer Turm hinzugefuegt. Das Spiel ist nach diesem Auftrag temporaer
nicht bezueglich Turmplatzierung spielbar - das ist beabsichtigt und
korrekt. Gegner-Wellen, Herzverlust, Game-Over und Verkaufen (soweit
nichts mehr zu verkaufen ist) muessen weiter funktionieren.

Konkrete Aenderungen:

1. Folgende Dateien LOESCHEN:
   - scripts/entities/BogenschuetzenNest.gd (+ .uid falls vorhanden)
   - scenes/towers/BogenschuetzenNest.tscn
   - resources/towers/bogenschuetzen_nest.tres
   - assets/sprites/towers/bogenschuetzen_nest.png (+ .import falls
     vorhanden)

2. scenes/levels/PrototypeLevel.tscn anpassen:
   - Die ExtResource-Referenzen auf BogenschuetzenNest.tscn und
     bogenschuetzen_nest.tres entfernen
   - Der HUD-Node hat aktuell starter_tower_scene und
     starter_tower_config gesetzt - diese Zuweisungen entfernen
     (die Properties selbst duerfen leer bleiben)

3. scripts/ui/HUD.gd leer-tolerant machen:
   - starter_tower_scene und starter_tower_config duerfen null sein
   - _show_build_menu(slot): wenn starter_tower_config null ist, statt
     "<Name> (<Kosten> Gold)" den Text "Kein Turm verfuegbar" anzeigen
     und den _build_confirm_button ausblenden (visible = false).
     Wenn nicht null: bisheriges Verhalten.
   - _on_build_confirm_pressed(): am Anfang Guard einbauen -
     wenn starter_tower_scene oder starter_tower_config null sind,
     Methode direkt verlassen (kein Crash).
   - Beim Ausblenden des BuildMenus (_on_build_cancel_pressed und
     anderswo) den _build_confirm_button.visible wieder auf true
     zuruecksetzen, damit spaeter wenn ein Turm da ist, er wieder
     sichtbar ist.

4. docs/GDD_Jungle_Tower_Defense.md aktualisieren:
   - Abschnitt 5.2 "Turmtypen": Der Eintrag "Bogenschuetzen-Nest" wird
     entfernt und durch "MG-Turm" ersetzt. Beschreibung fuer den
     MG-Turm: "Fernkampf, Einzelziel, schnelle Feuerrate, mittlerer
     Schaden. Sockel mit fest zur Kamera gerichtetem Fundament,
     rotierender MG-Turret auf dem Oberteil, der sich zum Ziel
     ausrichtet. Standard-DPS-Turm, geeignet gegen einzelne Gegner
     und Swarms mit hoher Feuerrate."
   - Der Text "MVP-Fokus: Bogenschuetzen-Nest" wird ueberall im
     Abschnitt zu "MVP-Fokus: MG-Turm" korrigiert.
   - Falls "Bogenschuetzen-Nest" an anderen Stellen im GDD referenziert
     ist: analog zu "MG-Turm" umbenennen.

5. STATUS.md aktualisieren:
   - Zeile "1 Turm (Bogenschuetzen-Nest)" auf "1 Turm (MG-Turm, noch
     nicht produziert)" aendern.
   - Zeile "Bogenschuetzen-Nest (Turm) und Dschungel-Spaeher (Gegner)
     sind die EINZIGEN Typen..." auf "MG-Turm (Turm) und
     Dschungel-Spaeher (Gegner) sind die EINZIGEN Typen..." aendern.
   - Am Ende einen neuen Update-Eintrag mit heutigem Datum hinzufuegen:
     "Bogenschuetzen-Nest komplett aus dem Projekt entfernt. MG-Turm
     ist der neue erste MVP-Turm, wird nach TowerBase-Refactor
     (Sockel + Turret + AttackBehavior) produziert. Spiel temporaer
     ohne platzierbaren Turm - dies ist gemaess Asset-Architektur
     v1.1 Section 15 beabsichtigt."
   - Die Notiz mit den beiden noch offenen Content-Bausteinen
     (Turm-Sprite Bogenschuetzen-Nest, Levelhintergrund) am Ende
     ersetzen durch: "Naechste Content-Bausteine: TowerBase-Refactor
     (Sockel + Turret + AttackBehavior), dann MG-Turm-Asset-Paket, dann
     MG-Turm-Integration, dann Level-Hintergrund-Einbau. Details in
     Asset_Animation_Architektur_v1.md Section 15."

6. Commit und Push:
   - Deutsche Commit-Message: "Bogenschuetzen-Nest komplett entfernt,
     HUD leer-tolerant gemacht, GDD und STATUS aktualisiert
     (Vorbereitung fuer MG-Turm nach Asset-Architektur v1.1)"
   - git push zu GitHub.

Der Auftrag ist erst fertig, wenn alle Aenderungen commited und gepusht
sind. Bei Unklarheiten: nachfragen, nicht raten (CLAUDE.md-Regel).
```

### Was danach getestet werden muss

Godot öffnen und Prototype-Level laden. Diese Checkliste prüfen:

- [ ] Godot startet ohne Fehler in der Console (keine "Missing dependency"
      oder "Cannot load"-Meldungen)
- [ ] PrototypeLevel.tscn lädt ohne Fehlerdialoge
- [ ] Spiel starten (F5)
- [ ] HUD zeigt korrekt an: `Gold: 100`, `Herzen: 20`, `Welle: 0`
- [ ] Auf einen leeren TowerSlot klicken/tappen
- [ ] BuildMenu erscheint, zeigt den Text "Kein Turm verfügbar"
- [ ] Kein "Bauen"-Button sichtbar (nur "Abbrechen")
- [ ] "Abbrechen" schließt das Menü
- [ ] "Welle starten" klicken
- [ ] Gegner (Dschungel-Späher) spawnen und laufen den Pfad entlang
- [ ] Gegner erreichen das Ende, Herzen sinken
- [ ] Nach 20 Gegner-Durchläufen: Game-Over-Panel erscheint
- [ ] "Neustart" funktioniert
- [ ] Keine Console-Errors während des Spielens

### Freigabe für Schritt 3

Alle Punkte oben grün + Aufräum-Commit ist auf GitHub sichtbar +
Projekt-Sync im Claude-Projekt getriggert.

**Sonderfall:** Falls Godot beim Öffnen "Missing dependencies" meldet
und den Fehler nicht selbst reparieren kann, kommt der Bug-Report in
den Chat, **nicht** manuelles Herumfrickeln in der `.tscn`. Meistens
liegt es an einer nicht entfernten `ExtResource`-Zeile.

---

## Schritt 3 – TowerBase-Refactor kombiniert (AttackBehavior + Sockel/Turret)

### Wer macht was

- **Claude Code** setzt den kompletten Refactor um (Code + Szenen +
  Configs)
- **Finn** testet, dass die zwei Legacy-Türme (Dornen-Kaserne,
  Giftschleuder) nach dem Refactor identisch funktionieren wie vorher

### Prompt für Claude Code

```
Refactor-Auftrag: TowerBase auf AttackBehavior-Komponenten und
Sockel/Turret-Aufbau umstellen (kombiniert, ein einziger Refactor).

Grundlage: docs/Asset_Animation_Architektur_v1.md Section 8
(Effekt-System - hier noch NICHT alles umzusetzen, nur der Turm-Teil
soweit noetig), Section 9 (AttackBehavior), Section 14 Regel 8
(Sockel/Turret als Standard).

Ziel des Refactors: TowerBase soll nach diesem Auftrag zwei Sprite-Slots
haben (Base statisch, Turret rotierbar), die Angriffslogik ueber
AttackBehavior-Resource-Instanzen laufen lassen statt ueber einen
is_aoe-Bool, und alle bestehenden Turm-Configs (Dornen-Kaserne,
Giftschleuder) muessen migriert werden. Das Spielverhalten der beiden
Legacy-Tuerme muss NACH dem Refactor exakt identisch sein zu VOR dem
Refactor - keine sichtbare oder mechanische Aenderung.

Der MG-Turm wird in diesem Auftrag NICHT gebaut. Nur die
Infrastruktur.

Konkrete Aenderungen:

1. Neuer Ordner scripts/entities/attack_behaviors/ mit drei Dateien:

   a) AttackBehavior.gd (abstrakte Basis)
      ```gdscript
      extends Resource
      class_name AttackBehavior

      ## Fuehrt einen Angriff aus. tower_context ist der aufrufende
      ## Turm und enthaelt Position, Config, Zugriff auf Effekte usw.
      func fire(tower_context: TowerBase) -> void:
          push_error("AttackBehavior.fire() muss ueberschrieben werden")
      ```

   b) SingleTargetAttack.gd
      - Kopiert die bisherige _fire_single-Logik aus TowerBase
      - Ruft tower_context._find_target(), spawnt Projektil (falls
        tower_context.config.projectile_scene gesetzt) oder wendet
        direkten Schaden an
      - Wichtig: Projektil-Spawn-Position ist ab jetzt der
        MuzzlePoint des Turrets (siehe unten Punkt 3), nicht mehr
        die Turm-Position selbst

   c) AoEAttack.gd
      - Kopiert die bisherige _fire_aoe-Logik aus TowerBase
      - Iteriert ueber alle enemies-Group-Nodes in
        tower_context.config.attack_range, wendet Schaden und ggf.
        DoT an

2. scripts/resources/TowerConfig.gd erweitern:

   Neue Felder:
   - @export var base_texture: Texture2D
       (ersetzt das bisherige "texture"-Feld semantisch)
   - @export var turret_texture: Texture2D
       (darf null sein; wenn null, gilt automatisch
       turret_rotation_enabled = false)
   - @export var turret_rotation_enabled: bool = true
   - @export var turret_rotation_speed: float = 5.0
       (Radiant pro Sekunde)
   - @export var turret_alignment_tolerance_deg: float = 5.0
       (Winkeltoleranz, bei der geschossen werden darf)
   - @export var attack_behavior: AttackBehavior
       (ersetzt das bisherige is_aoe-Bool)

   Bestehende Felder:
   - "texture" umbenennen auf "base_texture" (Feldname direkt aendern,
     alle Referenzen in TowerBase.gd nachziehen).
   - is_aoe komplett entfernen (wird durch attack_behavior ersetzt).
   - dot_damage_per_tick, dot_tick_interval, dot_duration bleiben
     erhalten - werden von AoEAttack aus tower_context.config
     ausgelesen.
   - projectile_scene bleibt erhalten - wird von SingleTargetAttack
     verwendet.

3. scenes/towers/TowerBase-Aufbau ueber das konkrete Turm-Szenen-
   Muster festlegen (keine separate TowerBase.tscn, weil die
   Szenen-Struktur pro Turm-.tscn definiert wird; TowerBase ist rein
   das Skript). Ab jetzt sieht die Szenenstruktur JEDES Turms so aus:

   TowerRoot (Node2D, mit TowerBase.gd bzw. abgeleitetem Skript)
   ├── Base (Sprite2D) - statisch, zeigt config.base_texture
   ├── Turret (Node2D) - rotiert um seinen (0,0)-Punkt
   │   ├── TurretSprite (Sprite2D) - zeigt config.turret_texture,
   │   │                             Blickrichtung rechts = 0 rad
   │   └── MuzzlePoint (Marker2D) - Kindknoten des Turret,
   │                                sitzt an der Waffenmuendung
   ├── DetectionArea (Area2D)
   │   └── CollisionShape2D (CircleShape2D, Radius = attack_range)
   └── FireTimer (Timer)

   Fuer Legacy-Tuerme mit turret_rotation_enabled = false darf
   Turret + TurretSprite + MuzzlePoint fehlen (dann uebernimmt der
   Base-Sprite die alte monolithische Rolle). Der MuzzlePoint fuer
   Projektil-Spawn faellt dann zurueck auf global_position des Turms
   (bisheriges Verhalten - siehe unten).

4. scripts/entities/TowerBase.gd umbauen:

   - _ready(): Base-Sprite mit config.base_texture setzen,
     Turret-Sprite mit config.turret_texture setzen (falls beide Nodes
     existieren). CollisionShape und FireTimer wie bisher konfigurieren.
   - _on_fire_timer_timeout(): DEFERRED lassen bis Turret ausgerichtet
     ist. Neue Logik:
       - Falls kein Ziel oder attack_behavior null: return
       - Falls turret_rotation_enabled true: pruefen ob Turret
         ausgerichtet ist (Winkelabweichung <=
         turret_alignment_tolerance_deg). Wenn nicht: return (Timer
         laeuft im naechsten Tick wieder; alternativ: Timer manuell
         neu starten mit kurzer Verzoegerung)
       - Sonst: config.attack_behavior.fire(self) aufrufen
   - _process(delta): NEU - Turret-Rotation zum Ziel.
       - Falls turret_rotation_enabled false: return
       - Falls kein Turret-Node in der Szene: return
       - Aktuelles Ziel per _find_target() holen
       - Wenn Ziel vorhanden: Zielwinkel berechnen
         (target.global_position - global_position).angle()
       - Turret-Rotation per lerp_angle() Richtung Zielwinkel
         interpolieren, mit config.turret_rotation_speed * delta
         als max. Aenderung. Wichtig: verwende
         rotate_toward oder eine aequivalente Clamp-Funktion,
         damit die Rotation nicht "wackelt".
   - _fire_single, _fire_aoe, _fire_projectile, _apply_hit: aus
     TowerBase ENTFERNEN. Diese Methoden leben jetzt in
     SingleTargetAttack.gd bzw. AoEAttack.gd.
   - _find_target(): BLEIBT in TowerBase. Wird von den
     AttackBehaviors ueber tower_context._find_target()
     aufgerufen. Sichtbarkeit von private zu public/protected
     aendern (Godot kennt kein protected; Methode einfach nicht mit
     Unterstrich-Prefix versehen: find_target()). ODER: Methode
     bleibt mit Underscore, aber es wird eine oeffentliche
     get_current_target()-Methode ergaenzt, die von AttackBehaviors
     verwendet wird. Waehle die Variante, die weniger Nebenwirkungen
     hat - dokumentiere die Wahl in einem Kommentar.
   - get_muzzle_global_position(): NEUE Hilfsmethode. Gibt die
     globale Position des MuzzlePoint-Nodes zurueck, falls vorhanden.
     Falls kein MuzzlePoint da ist (Legacy-Turm): gibt
     global_position zurueck (bisheriges Verhalten). Wird von
     AttackBehaviors und beim spaeteren Muzzle-Effect-Spawn genutzt.

5. resources/towers/dornen_kaserne.tres migrieren:
   - "texture" umbenennen auf "base_texture" (gleiche Referenz auf
     dornen_kaserne.png)
   - "turret_texture" leer lassen
   - "turret_rotation_enabled = false"
   - is_aoe-Feld weg (schon durch TowerConfig-Aenderung erledigt)
   - Neues Feld attack_behavior: eine Instanz von AoEAttack als
     SubResource anlegen

6. resources/towers/giftschleuder.tres migrieren:
   - Analog zu dornen_kaserne.tres:
     - texture -> base_texture
     - turret_texture leer
     - turret_rotation_enabled = false
     - attack_behavior: AoEAttack-Instanz
   - dot_damage_per_tick, dot_tick_interval, dot_duration bleiben
     wie sie sind (werden von AoEAttack ausgelesen)

7. scenes/towers/DornenKaserne.tscn und scenes/towers/Giftschleuder.tscn:
   - Beide Szenen nutzen aktuell einen einzelnen Sprite2D-Node
     namens "Sprite2D".
   - Umbenennen des vorhandenen "Sprite2D" auf "Base" (damit
     TowerBase-Skript ihn ueber $Base findet).
   - KEIN Turret-Node hinzufuegen (Legacy-Opt-out).
   - DetectionArea, CollisionShape2D, FireTimer bleiben wie sie sind.

8. TEMPORAERE Umleitung fuer den Test (WICHTIG):
   - scenes/levels/PrototypeLevel.tscn: den HUD-Node so anpassen,
     dass starter_tower_scene = DornenKaserne.tscn und
     starter_tower_config = dornen_kaserne.tres sind (temporaer, damit
     der Refactor-Test einen platzierbaren Turm hat). Diese Zuweisung
     wird in Schritt 5 (MG-Turm-Integration) wieder auf MG-Turm
     geaendert. Kommentar im .tscn (falls das geht) oder ansonsten
     im Commit-Text vermerken: "TEMPORAER Dornen-Kaserne als
     Starter-Turm, wird bei MG-Turm-Integration umgestellt".

9. STATUS.md aktualisieren:
   - Neuer Update-Eintrag mit heutigem Datum:
     "TowerBase-Refactor kombiniert abgeschlossen: AttackBehavior-
     Komponenten (SingleTargetAttack, AoEAttack) implementiert,
     Sockel/Turret-Struktur in TowerBase eingefuehrt (mit Opt-out
     ueber turret_rotation_enabled). Dornen-Kaserne und Giftschleuder
     auf neues System migriert - Verhalten identisch, keine Aenderung
     im Spielverlauf. TEMPORAER: Dornen-Kaserne als Starter-Turm im
     HUD, wird bei MG-Turm-Integration umgestellt."

10. Commit und Push:
    - Deutsche Commit-Message: "TowerBase-Refactor: AttackBehavior-
      Komponenten + Sockel/Turret-Struktur, Legacy-Tuerme migriert"
    - git push zu GitHub.

Bei Unklarheiten: nachfragen, nicht raten. Das Verhalten der beiden
Legacy-Tuerme MUSS identisch bleiben - das ist das Testkriterium.
```

### Was danach getestet werden muss

- [ ] Godot startet ohne Errors
- [ ] PrototypeLevel lädt
- [ ] Spielen: TowerSlot antippen → BuildMenu zeigt "Dornen-Kaserne (60 Gold)"
- [ ] Bauen: Dornen-Kaserne erscheint auf dem Slot
- [ ] Welle starten, Gegner spawnen
- [ ] Dornen-Kaserne trifft Gegner in ihrer AoE-Reichweite (kurze Distanz)
- [ ] Gegner nimmt Schaden, Lebensbalken sinkt
- [ ] Gegner stirbt → Gold-Reward wird gutgeschrieben
- [ ] Dornen-Kaserne verkaufen funktioniert → Refund kommt in Gold-Zähler
- [ ] Wichtig: Die Dornen-Kaserne dreht sich **nicht** – sie ist auf
      `turret_rotation_enabled = false`, das ist korrekt
- [ ] Kein visuelles "Zucken" oder Winkel-Wackeln (falls doch: Bug im
      Rotation-Code, obwohl die Dornen-Kaserne gar keine Rotation haben
      sollte)
- [ ] Console bleibt sauber (keine Warnings über null-Zugriffe)

### Freigabe für Schritt 4

Alle Punkte grün + Push auf GitHub + Projekt-Sync getriggert.

**Wichtig:** Der Refactor testet nur die Legacy-Türme. Die eigentliche
Turret-Rotation kann noch nicht getestet werden, weil kein Turm mit
`turret_rotation_enabled = true` existiert. Das kommt in Schritt 5.

---

## Schritt 4 – Erstes Asset-Paket-Dokument: `asset_paket_mg_turm_lvl1.md`

### Wer macht was

- **Claude Chat (ich)** schreibt das Asset-Paket-Dokument im Chat, wenn
  du "los Schritt 4" sagst
- **Finn** legt das Dokument in `docs/asset_pakete/` ab
- **Finn** arbeitet die einzelnen ChatGPT-Image-Prompts aus dem
  Dokument **im selben ChatGPT-Image-Chat** ab (Style-Anker-Regel!)
- **Finn + Photopea** stellt die generierten Bilder frei (echter
  Alpha-Kanal) und schneidet Sprite-Sheets bodenbündig zu
- **Finn** legt die fertigen PNGs an den im Dokument definierten
  Zielorten ab und committet sie

### Prompt für Claude Chat (mich, hier im Chat)

```
Los Schritt 4: Schreib das Asset-Paket-Dokument fuer den MG-Turm
Level 1. Ich brauche darin alle ChatGPT-Image-Prompts einzeln
formuliert, alle Ziel-Dateinamen, die QA-Checkliste pro Bild und
den fertigen Godot-Integration-Auftrag fuer Schritt 5.

Bestandteile, die das Paket enthalten soll (aus Asset-Architektur
Section 6.1):
- Pflicht: tower_mg_turm_lvl1_base.png, tower_mg_turm_lvl1_turret.png,
  tower_mg_turm_lvl1_icon.png
- Optional (empfohlen): tower_mg_turm_lvl1_turret_fire_sheet.png
- Zugehoerige Effekte: effect_muendungsfeuer_klein_sheet.png,
  effect_kugel_einschlag_sheet.png
- Zugehoeriges Projektil: projectile_kugel.png

Stil: gemaess StyleGuide und Prompt-Baukasten. Waffe zeigt nach
rechts (0 rad Referenz).
```

### Was danach getestet werden muss

Nachdem du alle Bilder erstellt und in die Zielordner gelegt hast:

- [ ] Alle im Paket-Dokument aufgelisteten Dateien existieren am
      angegebenen Ort mit exaktem Dateinamen
- [ ] Jedes PNG in Photopea öffnen: `Datei → Öffnen → Bild-Info` prüft
      dass ein echter Alpha-Kanal vorhanden ist (nicht nur
      Karo-Optik)
- [ ] Base-Sprite und Turret-Sprite zusammen betrachtet: der Turret
      passt maßstäblich auf den Sockel (bei 0° Rotation)
- [ ] Turret zeigt in Richtung rechts (Referenzrichtung) – nicht nach
      unten, oben oder links
- [ ] Sprite-Sheets haben gleiche Framehöhe und bodenbündige
      Ausrichtung
- [ ] Farbpalette matcht den StyleGuide (dominante militärische
      Grün-/Grau-Töne, keine warmen Rottöne)
- [ ] Konsistenter Stil mit dem Zielbild (Cel-Shading, keine
      Kratzer/Rost/Details)

### Freigabe für Schritt 5

Alle Assets liegen am richtigen Ort, QA-Checkliste grün. **In diesem
Schritt gibt es keinen Push von Claude Code** – die Assets werden von
dir manuell abgelegt. Wenn du willst kannst du sie **jetzt schon**
committen und pushen (deutsche Commit-Message: "MG-Turm Asset-Paket
lvl1: Bilder erzeugt und abgelegt"), oder das dem Schritt-5-Auftrag
mit überlassen.

---

## Schritt 5 – MG-Turm integrieren

### Wer macht was

- **Claude Code** integriert die MG-Turm-Assets, erstellt alle
  benötigten Godot-Resourcen und stellt den HUD-Starter-Turm um
- **Finn** testet in Godot, dass der MG-Turm sich zum Ziel dreht,
  schießt, Projektile fliegen und Effekte spielen

### Prompt für Claude Code

```
Integrations-Auftrag: MG-Turm Level 1 vollstaendig in das Spiel
einbauen.

Voraussetzungen (muessen erfuellt sein, sonst Auftrag abbrechen und
nachfragen):
- Der TowerBase-Refactor aus dem vorherigen Auftrag ist abgeschlossen
  (AttackBehavior + Sockel/Turret-Struktur, Legacy-Tuerme migriert).
- Die MG-Turm-Assets aus dem Asset-Paket liegen an den richtigen Orten:
  - assets/sprites/towers/tower_mg_turm_lvl1_base.png
  - assets/sprites/towers/tower_mg_turm_lvl1_turret.png
  - assets/sprites/towers/tower_mg_turm_lvl1_icon.png (kann noch fehlen)
  - assets/sprites/towers/tower_mg_turm_lvl1_turret_fire_sheet.png
    (optional)
  - assets/sprites/effects/effect_muendungsfeuer_klein_sheet.png
  - assets/sprites/effects/effect_kugel_einschlag_sheet.png
  - assets/sprites/projectiles/projectile_kugel.png
Falls eines der Pflicht-Assets fehlt: Auftrag NICHT starten, sondern
Finn im Chat informieren welches Asset fehlt.

Konkrete Aenderungen:

1. Neue Resource: resources/attack_behaviors/single_target_attack.tres
   - Instanz von SingleTargetAttack.gd (keine Parameter noetig)

2. Neue Resource: resources/effects/muendungsfeuer_klein.tres
   - Instanz von EffectConfig (siehe Asset-Architektur Section 8.2)
   - sprite_frames: SubResource, verweist auf das
     effect_muendungsfeuer_klein_sheet.png (Frame-Anzahl und Timing
     im Asset-Paket-Dokument spezifiziert - dort lesen)
   - scale: Vector2(1, 1)
   - z_index: 1 (ueber dem Turm)

3. Analog resources/effects/kugel_einschlag.tres

4. EffectBase-Grundszene bauen (falls noch nicht existiert):
   - scripts/entities/EffectBase.gd
     ```gdscript
     extends Node2D
     class_name EffectBase

     @export var config: EffectConfig

     @onready var _animated_sprite: AnimatedSprite2D = $AnimatedSprite2D

     func _ready() -> void:
         if config == null:
             push_warning("EffectBase: kein EffectConfig zugewiesen")
             queue_free()
             return
         if config.sprite_frames:
             _animated_sprite.sprite_frames = config.sprite_frames
         _animated_sprite.scale = config.scale
         z_index = config.z_index
         _animated_sprite.play(config.animation_name)
         _animated_sprite.animation_finished.connect(queue_free)
     ```
   - scenes/effects/EffectBase.tscn:
     - Root: Node2D mit EffectBase.gd
     - Kind: AnimatedSprite2D (leer, wird zur Laufzeit befuellt)

5. Neue Szene: scenes/towers/ProjectileKugel.tscn
   - Basierend auf scenes/towers/ProjectileBase.tscn (kopieren und
     anpassen)
   - Root: Node2D mit ProjectileBase.gd
   - Kind: Sprite2D mit projectile_kugel.png statt Polygon2D
   - Anpassung an ProjectileBase.gd: nach _impact() zusaetzlich zum
     bisherigen CPUParticles-Puff das kugel_einschlag.tres als
     EffectBase spawnen. Bevorzugt aber die alte CPUParticles-Loesung
     komplett durch das EffectBase-System ersetzen - siehe
     Asset-Architektur Section 8.3.

6. Neue Resource: resources/towers/mg_turm.tres
   - Instanz von TowerConfig
   - display_name: "MG-Turm"
   - base_texture: tower_mg_turm_lvl1_base.png
   - turret_texture: tower_mg_turm_lvl1_turret.png
   - turret_rotation_enabled: true
   - turret_rotation_speed: 5.0 (rad/s - kann in Balancing angepasst
     werden)
   - turret_alignment_tolerance_deg: 5.0
   - cost: 50
   - sell_refund_percent: 0.7
   - damage: 4 (bewusst etwas niedriger als das alte Bogenschuetzen-Nest
     zum Ausgleich der schnelleren Feuerrate - Balancing kommt spaeter)
   - fire_rate: 0.2 (schneller als Bogenschuetzen-Nest, MG-Charakter)
   - attack_range: 200.0
   - attack_behavior: single_target_attack.tres
   - projectile_scene: ProjectileKugel.tscn
   - (dot-Felder auf 0/leer belassen)

7. Neues Script: scripts/entities/MgTurm.gd
   ```gdscript
   extends TowerBase
   class_name MgTurm
   ```
   (bewusst leer - konkrete Turm-Klassen dienen nur der Typ-
   Unterscheidung; Verhalten kommt aus TowerBase + AttackBehavior)

8. Neue Szene: scenes/towers/MgTurm.tscn
   - Root: Node2D mit MgTurm.gd, config = mg_turm.tres
   - Base (Sprite2D) - texture aus config wird zur Laufzeit gesetzt
   - Turret (Node2D)
     - TurretSprite (Sprite2D) - texture aus config wird zur Laufzeit
       gesetzt
     - MuzzlePoint (Marker2D) - Position an der Waffenmuendung des
       Turret-Sprites (Koordinaten aus dem Asset-Paket-Dokument
       ablesen - dort steht die genaue Muzzle-Offset-Position bezogen
       auf den Turret-Sprite-Pivot)
   - DetectionArea (Area2D) mit CollisionShape2D (CircleShape2D,
     Radius wird zur Laufzeit aus config.attack_range gesetzt)
   - FireTimer (Timer)

9. Muzzle-Effect-Spawn in SingleTargetAttack.gd oder TowerBase.gd:
   - Wenn geschossen wird, zusaetzlich zum Projektil-Spawn ein
     EffectBase-Node mit muendungsfeuer_klein.tres spawnen
   - Position: tower_context.get_muzzle_global_position()
   - Rotation: erbt Turret-Rotation
   (Die genaue Umsetzung ist ein Design-Detail - dokumentiere die
   gewaehlte Loesung im Code-Kommentar)

10. scenes/levels/PrototypeLevel.tscn - HUD anpassen:
    - starter_tower_scene = MgTurm.tscn
    - starter_tower_config = mg_turm.tres
    - Der temporaere Dornen-Kaserne-Zustand aus Schritt 3 wird damit
      aufgehoben.

11. STATUS.md aktualisieren:
    - Neuer Update-Eintrag mit heutigem Datum:
      "MG-Turm Level 1 vollstaendig integriert. Erster Turm nach
      Asset-Architektur v1.1 (Sockel + rotierender Turret,
      SingleTargetAttack, mit Muendungsfeuer, MG-Kugel-Projektil,
      Impact-Effekt). Spiel ist wieder vollstaendig spielbar.
      Referenz-Muster fuer alle weiteren Turmproduktionen."

12. Commit und Push:
    - Deutsche Commit-Message: "MG-Turm Level 1 integriert:
      Sockel+Turret+Rotation, MG-Kugel-Projektil, Muendungsfeuer und
      Impact-Effekt; HUD auf MG-Turm als Starter umgestellt"
    - git push zu GitHub.

Bei Unklarheiten oder fehlenden Assets: NACHFRAGEN, nicht raten. Die
MuzzlePoint-Position ist ein Detail, das nicht falsch geraten werden
sollte - lieber im Chat klaeren.
```

### Was danach getestet werden muss

- [ ] Godot startet ohne Errors
- [ ] PrototypeLevel lädt, alle Assets korrekt referenziert
- [ ] Spielen: TowerSlot antippen → BuildMenu zeigt "MG-Turm (50 Gold)"
- [ ] Bauen: MG-Turm erscheint auf dem Slot
- [ ] MG-Turm zeigt Sockel + Turret (zwei sichtbare Ebenen)
- [ ] Welle starten
- [ ] **Turret rotiert sichtbar zum nächsten Gegner in Reichweite**
      (der entscheidende neue Test)
- [ ] Wenn Turret ausgerichtet ist: Schuss + Mündungsfeuer-Effekt
      erscheint an der Waffenmündung (nicht am Sockel-Mittelpunkt!)
- [ ] Projektil (MG-Kugel) fliegt vom MuzzlePoint zum Gegner
- [ ] Projektil trifft: Impact-Effekt spawnt am Gegner
- [ ] Gegner nimmt Schaden, stirbt bei 0 HP
- [ ] Gold-Reward wird gutgeschrieben
- [ ] Turret verfolgt Gegner smooth (kein Winkelspringen, kein Wackeln)
- [ ] Mehrere TowerSlots gleichzeitig bauen funktioniert
- [ ] Verkaufen funktioniert
- [ ] Console bleibt sauber

### Freigabe für Schritt 6

Alle Punkte grün + Push auf GitHub + Projekt-Sync getriggert.

Falls die Rotation ruckelt, das Mündungsfeuer an falscher Position
spawnt, oder das Projektil aus dem Sockel statt der Mündung kommt:
**Bug-Report in den Chat, nicht weitermachen.**

---

## Schritt 6 – Level-Hintergrund einbauen

### Wer macht was

- **Finn** legt die Hintergrund-Datei ab (`ChatGPT_Image_7__Juli_2026__21_29_47.png`
  → `assets/backgrounds/level_01_jungle_background.png`)
- **Claude Code** baut das PrototypeLevel auf den neuen Hintergrund um,
  richtet Path2D am sichtbaren Weg aus, platziert 8 TowerSlots an den
  Steinring-Positionen
- **Finn** öffnet Godot Editor und feinjustiert visuell (Path2D-Kurve
  ans Bild anpassen, TowerSlots exakt in die Steinringe zentrieren)
- **Finn** testet die Spielbarkeit

### Prompt für Claude Code

```
Umbau-Auftrag: PrototypeLevel auf gemalten Level-Hintergrund umstellen.

Voraussetzungen:
- MG-Turm ist integriert und funktioniert (Schritt 5 abgeschlossen).
- Die Hintergrund-Datei liegt bereit unter
  assets/backgrounds/level_01_jungle_background.png

Das Bild ist ein gemalter Levelhintergrund im Stil der Zielaesthetik
(Military Jungle). Es enthaelt: gemalter Erdpfad mit Verzweigung,
Fluss mit zwei Bruecken, Basis-Feldlager (unten rechts, gruene Flagge),
Gegner-Eingang (oben links, Steintor mit Totenkopfbanner), acht
sichtbare Steinring-Bauplaetze verteilt auf der Karte.

Konkrete Aenderungen:

1. scenes/levels/PrototypeLevel.tscn umbauen:

   a) Der bisherige Ground-Sprite2D (gruener Boden mit
      boden_dschungel.png) wird entfernt.

   b) Der bisherige PathVisual-Line2D (brauner Pfad mit pfad_erde.png)
      wird entfernt.

   c) Neuer Sprite2D-Node "LevelBackground" ganz oben in der Szenen-
      Hierarchie (VOR EnemyPath):
      - texture: level_01_jungle_background.png
      - centered: false
      - position: (0, 0)
      - z_index: -10 (damit alles andere darueber liegt)
      - Kein region_enabled, nutzt die volle Bildgroesse

   d) Groesse pruefen: Falls das Bild nicht 1920x1080 ist, per scale
      einpassen. Die Skala muss so gewaehlt sein, dass das Bild das
      gesamte Viewport (1920x1080) abdeckt, ohne das Aspect-Ratio zu
      verzerren.

2. scripts/systems/PrototypeLevel.gd anpassen:
   - Die aktuelle _build_path()-Methode NICHT loeschen, aber
     auskommentieren mit Kommentar "Legacy - manuell im Editor
     ueberschrieben, siehe Editor-Path2D-Curve". Die Path2D-Curve
     wird jetzt manuell im Godot-Editor gesetzt (durch Finn), nicht
     mehr per Code generiert.
   - _ready() macht kein _build_path() mehr, sondern verlaesst sich
     auf die im Editor gesetzte Curve.

3. EnemyPath (Path2D-Node) in der .tscn vorbereiten:
   - Die aktuelle Curve loeschen (falls im .tscn-File gesetzt).
   - Neue leere Curve setzen. Finn wird die Curve manuell im Editor
     entlang des sichtbaren Pfads zeichnen.
   - AlS Ausgangspunkt: fuege ca. 4 Platzhalter-Punkte in den Curve
     ein (linke Bildseite bei y ~500, dann leichte Rechtsbewegung),
     damit ueberhaupt eine sichtbare Curve zum Feinjustieren da ist.

4. TowerSlots umbauen:
   - Die aktuell 5 TowerSlot-Nodes durch 8 TowerSlot-Nodes ersetzen.
   - Positionen sind Platzhalter (auf ca. 25%, 40%, 60%, 25%|75%,
     40%, 60% des Bildes verteilen) - Finn justiert danach manuell
     auf die Steinring-Zentren.
   - Alle CollisionShape2D-Radien: Radius 45 (etwas kleiner als
     bisher, damit die Slots visuell klarer sind).

5. scripts/entities/TowerSlot.gd - _draw() anpassen:
   - Der bisherige dunkle Kreis mit hellem Rand und Kreuz wird
     ENTFERNT (bzw. auf visible = false in Standardzustand).
   - Grund: Der Steinring ist bereits im Hintergrundbild gemalt,
     der gezeichnete Marker wuerde doppeln.
   - Stattdessen: nur einen dezenten Hover- oder Selected-Overlay
     zeichnen. Vorschlag: ein halbtransparenter goldener Kreis
     (Color(0.92, 0.61, 0.02, 0.4)), wenn der TowerSlot vom Spieler
     antippbar ist (also nicht is_occupied). Der Overlay ist bei
     Grundzustand mit sehr geringer Deckkraft sichtbar (0.15),
     und wird kraeftiger (0.4) bei Hover/Selected.
   - Fuer den ersten Wurf reicht die Grundzustands-Variante mit
     leichter Transparenz - Hover-Logik ist optional und kann
     spaeter im Polish-Pass ergaenzt werden.

6. STATUS.md aktualisieren:
   - Neuer Update-Eintrag mit heutigem Datum:
     "Level-Hintergrund (gemaltes Bild) in PrototypeLevel integriert.
     Alter grueneres Ground-Sprite und brauner PathVisual-Line2D
     entfernt. Path2D-Curve wird ab jetzt manuell im Godot-Editor
     gesetzt (nicht mehr per Code). Acht TowerSlots als
     Platzhalter angelegt - Finn justiert visuell auf die
     Steinring-Zentren des Hintergrundbilds. TowerSlot-Overlay
     dezent gehalten, damit die gemalten Steinringe des Hintergrunds
     zur Geltung kommen."

7. Commit und Push:
   - Deutsche Commit-Message: "Level-Hintergrund eingebaut:
     PrototypeLevel nutzt gemalten Hintergrund, Ground+PathVisual
     entfernt, TowerSlot-Overlay dezent, 8 Slots als Platzhalter
     (manuelle Feinjustierung durch Finn folgt)"
   - git push zu GitHub.

Nach dem Push ist der Auftrag NICHT abgeschlossen im Sinne von
"fertig eingerichtet" - Finn muss die manuelle Feinjustierung im
Godot-Editor machen. Der Auftrag ist abgeschlossen im Sinne von
"technische Basis steht, jetzt kann visuell justiert werden".

Bei Unklarheiten (z.B. wie genau EnemyPath eine leere Curve bekommt):
nachfragen, nicht raten.
```

### Was du danach manuell in Godot machen musst

Nach Claude Codes Push ist das Level noch nicht fertig – die visuelle
Feinjustierung ist deine Aufgabe (weil sie exakt an das Bild angepasst
sein muss, was Claude Code nicht sehen kann).

1. **Godot öffnen** und PrototypeLevel.tscn laden
2. **EnemyPath-Node auswählen** (Path2D)
3. **Curve-Bearbeiten-Modus** aktivieren (kleines Kurvensymbol in der
   oberen Toolbar)
4. **Curve entlang des sichtbaren Pfads zeichnen:**
   - Erster Punkt: **links vom Steintor**, außerhalb des Bilds (bei
     ca. x=-50, y=???, damit Gegner nicht "aus dem Nichts" auftauchen)
   - Zweiter Punkt: **an der Öffnung des Steintors** (der schwarze
     Bogen unter dem Totenkopf)
   - Weitere Punkte entlang des braunen Erdpfads – **so setzen, dass
     der Pfad glatt fließt**, nicht mit Ecken. Nutze die
     Kurven-Handles (klick + drag an einem Punkt) für Rundungen.
   - Wichtig: Der Pfad muss über die **Brücken** führen, nicht durch
     den Fluss.
   - Letzter Punkt: **kurz vor dem Zeltlager** unten rechts,
     danach optional ein weiterer Punkt außerhalb des Bildes.
5. **Testen**: F5 drücken, Welle starten, prüfen dass Gegner sich
   auf dem gezeichneten Pfad bewegen und nicht daneben.
6. **8 TowerSlots positionieren:**
   - Reihenfolge im Node-Baum egal – wichtig ist die
     `position`-Property jedes TowerSlot-Nodes
   - Für jeden TowerSlot: **anklicken → im Editor auf den
     Bildmittelpunkt des gewünschten Steinrings ziehen**
   - Der CollisionShape2D-Kreis sollte den Steinring vollständig
     abdecken, aber nicht darüber hinaus
7. **Testen**: Spiel starten, jeden Steinring antippen, MG-Turm
   platzieren. Der Turm muss **zentriert im Steinring** sitzen,
   nicht daneben.
8. Falls TowerSlots verschoben werden mussten: **die Änderungen in
   Godot speichern** (Ctrl+S), dann Datei-Explorer öffnen,
   PrototypeLevel.tscn hat sich geändert → committen und pushen (per
   Claude Code oder manuell).

### Was danach getestet werden muss

- [ ] Level lädt mit gemaltem Hintergrund als visueller Grundlage
- [ ] Kein grüner Ground und kein brauner Line2D-Pfad mehr sichtbar
- [ ] 8 Steinringe im Bild haben je einen antippbaren TowerSlot
      darauf zentriert
- [ ] Gegner spawnen am Steintor (links oben) und laufen auf dem
      gemalten Pfad
- [ ] Gegner überqueren die Brücken (nicht durch den Fluss)
- [ ] Gegner erreichen das Zeltlager (rechts unten)
- [ ] MG-Turm auf allen 8 Steinringen platzierbar
- [ ] MG-Turm sitzt visuell zentriert im Steinring (nicht daneben)
- [ ] Turret rotiert weiterhin korrekt zum Gegner
- [ ] Schuss + Effekte funktionieren wie bei Schritt 5
- [ ] Sieg + Game-Over funktionieren weiterhin

### Freigabe: Ende des Blueprints

Alle Punkte grün → **Meilenstein "Level-Hintergrund fertig eingebaut"
erreicht.**

Das ist das Ende dieses Blueprints. Danach folgen die Schritte 7
(Gegner-Paket Späher-Erweiterung), 8 (Animation-State-Machine für
Gegner) und 9 (Balancing-Pass) aus Asset-Architektur Section 15 –
die bekommst du dann als eigenen, kleineren Blueprint.

---

## Was du jetzt griffbereit haben solltest

Beim Abarbeiten hilft es, folgendes offen zu haben:

1. **Dieses Blueprint-Dokument** (als Referenz)
2. **Asset-Architektur v1.1** (`docs/Asset_Animation_Architektur_v1.md`)
3. **StyleGuide** (`docs/StyleGuide_Jungle_Tower_Defense.md`)
4. **Prompt-Baukasten** (`docs/Prompt_Baukasten_Assets.md`)
5. **Godot 4.7 mit dem Projekt geöffnet**
6. **Claude Code im Projektordner**
7. **ChatGPT-Image-Chat** (den ihr bereits erfolgreich für den
   Dschungel-Späher verwendet habt – Style-Anker!)
8. **Photopea im Browser-Tab**

## Bei Bug-Reports an mich

Wenn etwas nicht funktioniert, brauche ich für einen guten Fix-Auftrag:

- Welcher Schritt gerade läuft
- Welcher Teil des Tests fehlgeschlagen ist (zitier die Checkliste)
- Wenn Godot-Error: die genaue Console-Meldung
- Wenn visueller Fehler: kurze Beschreibung oder Screenshot
- Was Claude Code als Antwort gegeben hat (die letzte Nachricht, falls
  Claude Code selbst schon eine Diagnose gestellt hat)

Mit diesen Angaben formuliere ich einen präzisen Fix-Prompt, den du
wieder an Claude Code weitergibst.
