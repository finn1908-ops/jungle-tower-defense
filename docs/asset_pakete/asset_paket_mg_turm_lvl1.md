# Asset-Paket: MG-Turm Level 1

**Status:** Entwurf
**Zuständiger Chat-Kontext:** *(hier den Namen/Link deines persistenten ChatGPT-Image-Chats eintragen, in dem bisher alle Jungle-Tower-Defense-Assets erzeugt wurden – Style-Anker-Regel, siehe Asset_Animation_Architektur_v1 Abschnitt 12 Schritt 2. Alle Prompts unten werden in genau diesem Chat abgearbeitet, in der angegebenen Reihenfolge.)*

**Bezug:** Folgt der Vorlage aus `Asset_Animation_Architektur_v1.md` Abschnitt 6, angepasst gemäß Turm-Regel Abschnitt 6.1 (Sockel + Turret, Rotation aktiv).

---

## 0. Preflight-Check vor Finalisierung

- [x] Aktuelle `Asset_Animation_Architektur_v1.md` (Status v1.2) geprüft
- [x] Relevante Base-Skripte geprüft: `scripts/entities/TowerBase.gd`,
      `scripts/entities/ProjectileBase.gd`
- [x] Relevante Config-/Resource-Skripte geprüft: `scripts/resources/TowerConfig.gd`,
      `scripts/resources/EffectConfig.gd`, sowie `scripts/entities/attack_behaviors/SingleTargetAttack.gd`
- [x] Alle Feldnamen im Integrationsauftrag entsprechen dem aktuellen Code
      oder werden im Auftrag explizit neu angelegt (siehe Fußnoten in
      Abschnitt 4)
- [x] Keine alten Architekturbegriffe verwendet, die im aktuellen
      Projektstand nicht mehr gelten
- [x] Keine Referenz auf nicht existierende Szenen wie z. B.
      `TowerBase.tscn` – `TowerBase.gd` ist reines Skript, `MgTurm.tscn`
      ist die konkrete Szene
- [x] Unklare Punkte sind als „Claude Code prüfen / nachfragen" markiert,
      nicht geraten (siehe Abschnitt 4, Punkt 4 – Impact-Effect-Übergabe
      an das Projektil)

**Ergebnis des Checks (wichtig für Schritt 5):** Das `EffectBase`/`EffectConfig`-
System aus Architektur-Abschnitt 8 ist im Code bisher nur teilweise
vorhanden. `EffectConfig.gd` existiert bereits (siehe Kommentar im Skript:
„Die EffectBase-Szene und das Spawn-Verhalten aus Section 8.1/8.3 folgen in
einem späteren Auftrag."). `EffectBase.gd`/`EffectBase.tscn` existieren
**noch nicht**. `TowerConfig.gd` hat bereits die Felder
`muzzle_effect_config` und `impact_effect_config`, aber weder
`SingleTargetAttack.gd` noch `ProjectileBase.gd` lesen sie aus.
`ProjectileBase._spawn_hit_effect()` nutzt weiterhin eine inline
`CPUParticles2D`-Lösung. Dieses Paket nimmt den Bau von `EffectBase`
deshalb ausdrücklich in den Schritt-5-Integrationsauftrag mit auf (siehe
Abschnitt 4) – sonst können die Effekt-Tests aus der Test-Checkliste gar
nicht bestehen.

Außerdem: `TowerConfig.gd` hat **kein** `icon`-Feld, und `HUD.gd` rendert
aktuell kein Turm-Icon (BuildMenu ist textbasiert:
`"%s (%d Gold)" % [starter_tower_config.display_name, starter_tower_config.cost]`).
Das Icon wird deshalb in diesem Paket nur als UI-Asset abgelegt, aber
nicht in Schritt 5 in den Code verdrahtet (siehe Abschnitt 4, Punkt 1 und
Test-Checkliste).

---

## 1. Bestandteile des Pakets

| Bestandteil | Dateiname | Ordner | Status |
|---|---|---|---|
| Sockel (Base) | `tower_mg_turm_lvl1_base.png` | `assets/sprites/towers/` | Offen |
| Turret (Waffe) | `tower_mg_turm_lvl1_turret.png` | `assets/sprites/towers/` | Offen |
| Icon (UI-Asset, noch nicht integriert) | `tower_mg_turm_lvl1_icon.png` | `assets/sprites/ui/icons/` | Offen |
| Turret-Recoil-Sheet (optional) | `tower_mg_turm_lvl1_turret_fire_sheet.png` | `assets/sprites/towers/` | Offen |
| Mündungsfeuer (geteilt) | `effect_muendungsfeuer_klein_sheet.png` | `assets/sprites/effects/` | Offen |
| Einschlag-Effekt (geteilt) | `effect_kugel_einschlag_sheet.png` | `assets/sprites/effects/` | Offen |
| Projektil | `projectile_kugel.png` | `assets/sprites/projectiles/` | Offen |

„Geteilt" heißt hier: Mündungsfeuer und Einschlag-Effekt sind bewusst so
generisch gehalten, dass spätere Türme mit ähnlicher Ballistik (z. B.
Scharfschützen-Turm) sie wiederverwenden können, ohne neue Assets zu
brauchen (Regel aus Abschnitt 6.1: geteilte Assets werden trotzdem im
Paket-Dokument des jeweiligen Turms mit aufgeführt).

**Opt-out-Vermerk:** entfällt – der MG-Turm hat aktive Turret-Rotation
(`turret_rotation_enabled = true`), ist also kein Sonderfall.

---

## 2. ChatGPT-Image-Prompts

Reihenfolge ist bewusst gewählt: Sockel zuerst (legt Maßstab und
Drehscheiben-Durchmesser fest), dann Turret (muss exakt auf die
Drehscheibe passen), dann die kleineren/wiederverwendbaren Teile,
Icon zuletzt (zeigt das fertige Zusammenspiel).

Alle Prompts im selben Chat, einzeln nacheinander abarbeiten. Nach jedem
Bild kurze Sichtprüfung anhand der QA-Checkliste (Abschnitt 3), bevor der
nächste Prompt kommt.

### Prompt 1: Sockel (`tower_mg_turm_lvl1_base.png`)

```
Erstelle ein Game-Asset-Sprite für einen Turm-Sockel in einem Mobile
Tower-Defense-Spiel im Kingdom-Rush-Stil mit militärischem
Dschungel-Setting.

Objekt: MG-Turm-Sockel, Level 1. Ein befestigter, kompakter
Verteidigungsstand aus grob gestapelten Sandsäcken (Farbton angelehnt an
Pfad-Palette #BA8A4E / #8A6636) auf einer verstärkten Holz-/Metall-
Plattform in gedecktem Oliv-Grün (#36421E, #424E1E). Oben in der Mitte
markiert eine kleine, kreisrunde Drehscheibe aus dunklem Metall
(#66664E) die Stelle, an der später separat ein Turret aufgesetzt wird –
diese Fläche muss frei von Details bleiben (keine Waffe, kein Soldat
darauf), da sie als eigenes Bild darüber positioniert wird.

Perspektive: Top-Down, leicht isometrisch, kamera-ausgerichtet (frontal-
erhöhte Ansicht wie bei Kingdom-Rush-Türmen) – nicht seitlich gedreht,
nicht schräg von der Seite.

Stil: Cel-Shading, klare dunkle Outlines, satte aber nicht grelle
Farben, keine fotorealistischen Texturen, keine blühende/bunte
Vegetation. Militärisch-rustikal, keine Hochglanz-Optik.

Technisch: Freistehendes Objekt auf transparentem Hintergrund, kein
eingebackener Bodenschatten (Schatten wird separat in der Engine
gerendert), Objekt zentriert, ausreichend Rand unten für sauberen
Beschnitt am Fußpunkt.

Referenzgröße: Grundfläche und Höhe sollen zur Silhouette eines
klassischen kompakten Tower-Defense-Turms passen – nicht überdimensioniert,
passend für ein Feld mit vielen gleichzeitig sichtbaren Türmen und
Gegnern.
```

### Prompt 2: Turret (`tower_mg_turm_lvl1_turret.png`)

```
Erstelle das Turret (Waffenoberteil) für denselben MG-Turm, Level 1 –
im selben Chat und exakt demselben Stil wie der eben erzeugte Sockel
(Style-Anker beibehalten, gleiche Farbpalette, gleiche Outline-Stärke).

Objekt: Ein leichtes Maschinengewehr auf drehbarer Lafette, montiert auf
einer kleinen kreisrunden Basis-Platte mit demselben Durchmesser wie die
Drehscheibe des Sockels. Der Waffenlauf zeigt exakt nach rechts
(horizontale 0°-Referenzrichtung) – das ist verbindlich, die
Rotationslogik im Spiel rechnet von dieser Ausgangsausrichtung aus.
Optional ein kleiner geduckter Bediener in olivgrüner Uniform hinter der
Waffe, falls das den Kingdom-Rush-Charakter verstärkt (kein Muss).

Perspektive & Stil: identisch zum Sockel – Top-Down, leicht isometrisch,
Cel-Shading, Kernpalette einhalten (Waffenmetall dunkel/stone #66664E,
Uniform oliv #36421E, sparsame Gold-/Messing-Akzente #EA9C06 an
Mechanik-Details).

Technisch: Transparenter Hintergrund. Der Pivot-Punkt ist die Drehachse
der Waffe = der Mittelpunkt der runden Basis-Platte, NICHT die Mündung.
Dieser Punkt muss in der geometrischen Mitte des Canvas liegen (wichtig
für die Rotation in der Engine). Der Lauf darf deutlich nach rechts aus
der runden Basis herausragen, muss aber vollständig innerhalb des
transparenten Canvas sichtbar bleiben. Rechts genügend transparenten
Rand lassen, nichts abschneiden.
```

### Prompt 3: Turret-Recoil-Sheet, optional (`tower_mg_turm_lvl1_turret_fire_sheet.png`)

```
Erstelle eine 3-Frame Recoil-Sequenz desselben Turrets – identischer
Winkel, identische Ausrichtung nach rechts, gleicher Chat/Stil wie
Prompt 2.

Frame 1: Ruheposition, identisch zum bereits erzeugten Turret-Bild.
Frame 2: Waffe im Rückstoß – Lauf sichtbar leicht nach hinten verschoben,
kleiner heller Mündungsblitz-Ansatz und ein Hauch Rauch am Lauf.
Frame 3: Übergang zurück Richtung Ruheposition.

Alle drei Frames exakt gleiche Bildgröße und derselbe Pivot-Punkt
(Drehachse mittig im Canvas) wie in Prompt 2 – sonst ruckelt die
Sequenz beim Abspielen. Frames nebeneinander in einem Sprite-Sheet mit
gleich breiten Segmenten, transparenter Hintergrund.
```

### Prompt 4: Mündungsfeuer (`effect_muendungsfeuer_klein_sheet.png`)

```
Erstelle ein 3-Frame Mündungsfeuer-Effekt-Sprite-Sheet für Handfeuer-
waffen im selben Spielstil (Cel-Shading, Kingdom-Rush-artig).

Ein kleiner, kompakter Feuerblitz/Rauchpuff in warmen Gelb-Orange-Tönen
(Basis-Akzentfarbe #EA9C06, hellere Ausläufer Richtung Weiß-Gelb), keine
realistische Explosion, sondern stilisiert/comic-artig. Frame 1: kurzes
helles Aufblitzen. Frame 2: volle Größe. Frame 3: Abklingen/Verblassen.

Alle Frames gleiche Canvas-Größe, Pivot mittig – der Effekt wird an der
Mündung positioniert und übernimmt seine Rotation vom übergeordneten
Turret-Node, dreht sich also nicht selbst. Transparenter Hintergrund,
kompakte Größe, deutlich kleiner als der Turm selbst.
```

### Prompt 5: Einschlag-Effekt (`effect_kugel_einschlag_sheet.png`)

```
Erstelle ein 3-Frame Einschlag-Effekt-Sprite-Sheet, passend zum
MG-Projektil, im selben Spielstil.

Ein kleiner Staub-/Funken-Impact, Farbgebung angelehnt an Stein-/Erdton
(#66664E, #8A6636) mit einem kurzen hellen Funken-Akzent. Stilisiert und
zurückhaltend, nicht blutig oder drastisch (Gegner sind stilisierte
Soldaten-Silhouetten, kein Gore-Look).

Alle Frames gleiche Canvas-Größe, Pivot = Einschlagspunkt (Zentrum),
transparenter Hintergrund.
```

### Prompt 6: Projektil (`projectile_kugel.png`)

```
Erstelle ein einzelnes Projektil-Sprite für den MG-Turm im selben
Spielstil: eine kleine, stilisierte Gewehrpatrone/Kugel in Seitenansicht,
horizontal ausgerichtet (Flugrichtung nach rechts, gleiche 0°-Referenz
wie das Turret). Dunkles Metall mit einem warmen Glanzlicht-Akzent.

Sehr klein und einfach gehalten, da sie im Spiel meist nur als kurzer
Strich/Blitz während des Flugs sichtbar ist. Transparenter Hintergrund,
Pivot = Zentrum.
```

### Prompt 7: Icon (`tower_mg_turm_lvl1_icon.png`)

```
Erstelle ein 128×128 UI-Icon, das den fertigen MG-Turm (Sockel + Turret
kombiniert, wie er im Spiel aussehen wird) als Miniaturansicht zeigt –
frontal, klar erkennbar auch in kleiner Darstellung. Hinweis: Dieses Icon
wird vorerst nur als UI-Asset abgelegt und noch nicht im BuildMenu
gerendert (siehe Abschnitt 4) – trotzdem in korrekter Zielauflösung
produzieren, damit es bereitsteht, sobald das UI-Polish diesen Slot
bekommt.

Im Gegensatz zu den anderen Assets: dieses Icon hat einen dezenten
dunklen Panel-Hintergrund passend zum UI-Stil (#121212), ist also NICHT
transparent, sondern ein vollständiges eigenständiges Icon mit
Hintergrundfläche. Gleicher Cel-Shading-Stil und gleiche Farbpalette wie
Sockel/Turret.
```

---

## 3. QA-Checkliste (pro Bild)

- [ ] Perspektive korrekt (Top-Down, leicht isometrisch, kein Seitenwinkel)
- [ ] Stil-Anker gehalten (Cel-Shading, keine realistischen Details, keine blühende Vegetation)
- [ ] Farbpalette aus der verbindlichen Kernpalette (siehe Prompts oben)
- [ ] Alpha-Kanal echt (Photopea-Freistellung erfolgt, kein Fake-Karo)
- [ ] Bei Sheets (Recoil, Mündungsfeuer, Einschlag): alle Frames exakt gleiche Canvas-Größe, Pivot konsistent über alle Frames
- [ ] Pivot-Punkt korrekt gemäß Abschnitt 10 der Architektur-Doku:
  - Sockel → Unten-Mitte
  - Turret / Turret-Fire-Sheet → Drehachse der Waffe, mittig im Canvas
  - Mündungsfeuer / Einschlag / Projektil → Zentrum
  - Icon → kein Pivot relevant (UI-Element)
- [ ] Turret: Waffe zeigt exakt horizontal nach rechts (0°-Referenz)
- [ ] Sockel und Turret: Drehscheiben-Durchmesser stimmen optisch überein, Turret sitzt sauber zentriert auf dem Sockel
- [ ] Größenverhältnis zum aktuellen Bogenschützen-Nest/TowerSlot ist stimmig (kein auffälliger Ausreißer nach oben oder unten, siehe Abschnitt 0 der Architektur-Doku zur Skalierungs-Abhängigkeit)

**Nach der Bildproduktion zusätzlich zu ermitteln (vor Schritt 5 nötig):**
Sobald `tower_mg_turm_lvl1_turret.png` fertig freigestellt in Photopea
vorliegt, muss der exakte Pixel-Offset des Mündungspunkts (Ende des
Laufs) relativ zur Bildmitte/Drehachse gemessen und hier notiert werden:

- MuzzlePoint-Offset (x, y in Pixern, relativ zum Turret-Pivot): `___`

Dieser Wert wird in Schritt 5 für den `MuzzlePoint`-Marker-Node
gebraucht (`Turret/MuzzlePoint`, siehe `TowerBase.gd`).

---

## 4. Godot-Integration (Auftrag für Schritt 5)

Sobald alle Bilder produziert, in Photopea nachbearbeitet, QA-geprüft
und im richtigen Ordner abgelegt sind (siehe Abschnitt 1), und der
MuzzlePoint-Offset oben eingetragen ist, folgender Auftrag an Claude
Code:

```
Auftrag: MG-Turm integrieren (Schritt 5, Asset-Paket
docs/asset_pakete/asset_paket_mg_turm_lvl1.md)

Voraussetzungs-Check zuerst: prüfe, ob folgende Dateien existieren.
Falls eine fehlt: Auftrag abbrechen und melden, welche Datei fehlt.
- assets/sprites/towers/tower_mg_turm_lvl1_base.png
- assets/sprites/towers/tower_mg_turm_lvl1_turret.png
- assets/sprites/ui/icons/tower_mg_turm_lvl1_icon.png
- assets/sprites/effects/effect_muendungsfeuer_klein_sheet.png
- assets/sprites/effects/effect_kugel_einschlag_sheet.png
- assets/sprites/projectiles/projectile_kugel.png
- (optional, falls vorhanden) assets/sprites/towers/tower_mg_turm_lvl1_turret_fire_sheet.png

Aufgaben:

1. Neue Szene scenes/towers/MgTurm.tscn anlegen: Root-Node `Node2D`,
   Skript `MgTurm.gd` (`extends TowerBase`). `TowerBase.gd` ist
   ausschließlich das Basis-Skript, keine eigene Szene – MgTurm.tscn ist
   die erste konkrete Turm-Szene, die davon erbt. Szenenstruktur exakt
   nach dem, was TowerBase.gd über @onready get_node_or_null erwartet:
   - `Base` (Sprite2D, tower_mg_turm_lvl1_base.png)
   - `Turret` (Node2D, rotierbar)
     - `TurretSprite` (Sprite2D, tower_mg_turm_lvl1_turret.png)
     - `MuzzlePoint` (Marker2D, Offset gemäß Abschnitt 3 dieses
       Asset-Pakets)
   - `DetectionArea` (Area2D)
     - `CollisionShape2D` (CircleShape2D, Radius wird zur Laufzeit aus
       config.attack_range gesetzt, siehe TowerBase._ready())
   - `FireTimer` (Timer)

2. Icon-Integration: Icon wird nur als UI-Asset abgelegt
   (assets/sprites/ui/icons/tower_mg_turm_lvl1_icon.png). BuildMenu
   bleibt vorerst textbasiert (HUD.gd zeigt aktuell
   "%s (%d Gold)" % [display_name, cost], kein Icon-Rendering).
   UI-Icon-Integration ist ein späterer UI-Polish-Auftrag, sofern kein
   Icon-Feld im aktuellen Code existiert. Kein `icon`-Feld in
   TowerConfig.gd ergänzen oder setzen im Rahmen dieses Auftrags.

3. Neue Resource resources/towers/mg_turm.tres anlegen (Felder gemäß
   aktuellem TowerConfig.gd-Stand):
   - display_name = "MG-Turm"
   - base_texture = tower_mg_turm_lvl1_base.png
   - turret_texture = tower_mg_turm_lvl1_turret.png
   - turret_rotation_enabled = true
   - turret_rotation_speed = 6.0 (rad/s, Platzhalter)
   - turret_alignment_tolerance_deg = Standardwert (5.0) übernehmen,
     außer ein Testlauf zeigt, dass ein anderer Wert nötig ist
   - attack_behavior = neue SingleTargetAttack-Instanz
   - damage = 4 (Platzhalter)
   - fire_rate = 0.2 (Sekunden, Platzhalter)
   - attack_range = 200 (px, Platzhalter)
   - cost = 50 (Gold, Platzhalter)
   - muzzle_effect_config = Verweis auf
     resources/effects/muendungsfeuer_klein.tres
   - impact_effect_config = Verweis auf
     resources/effects/kugel_einschlag.tres
   - projectile_scene = res://scenes/towers/MgProjectile.tscn (siehe
     Punkt 5)
   Alle Platzhalter-Werte werden im Balancing-Pass (Schritt 9)
   kalibriert – jetzt nur so setzen, dass der Turm spielbar ist.

4. EffectBase-System aufbauen (existiert im Code noch nicht,
   Architektur-Doku Abschnitt 8 ist bisher nur Ziel-Zustand, kein
   Ist-Zustand):
   - scripts/entities/EffectBase.gd anlegen: Node2D mit AnimatedSprite2D-
     Kind, das die per EffectConfig referenzierten sprite_frames einmal
     abspielt (animation_name) und sich danach selbst queue_free()t.
   - scenes/effects/EffectBase.tscn anlegen (Root Node2D + Skript
     EffectBase.gd + AnimatedSprite2D-Kind).
   - EffectConfig.gd existiert bereits unverändert
     (sprite_frames, animation_name, scale, z_index) – keine Änderung
     nötig, nur verwenden.
   - resources/effects/muendungsfeuer_klein.tres anlegen:
     EffectConfig mit SpriteFrames aus
     effect_muendungsfeuer_klein_sheet.png.
   - resources/effects/kugel_einschlag.tres anlegen: EffectConfig mit
     SpriteFrames aus effect_kugel_einschlag_sheet.png.

5. Muzzle- und Impact-Effekt-Spawning verdrahten:
   - SingleTargetAttack.gd nutzt tower_context.config.muzzle_effect_config,
     falls gesetzt: beim Schuss eine EffectBase-Instanz an
     tower_context.get_muzzle_global_position() spawnen (analog zum
     bestehenden Projektil-Spawn-Pattern in _fire_projectile()).
   - Beim Erzeugen des Projektils (_fire_projectile() in
     SingleTargetAttack.gd) wird die Impact-Effect-Config aus
     tower_context.config.impact_effect_config an das Projektil
     übergeben, falls die aktuelle Projektilarchitektur das zulässt.
     Aktueller Stand: ProjectileBase.gd hat aktuell kein Feld, das eine
     EffectConfig entgegennimmt (launch(target, on_hit) kennt keinen
     Effekt-Parameter). Falls das im aktuellen Code nicht direkt möglich
     ist, soll Claude Code nachfragen und nicht raten, statt eigenständig
     zu entscheiden, ob z. B. ein neues @export-Feld auf ProjectileBase
     oder eine Erweiterung von launch() der richtige Weg ist.
   - ProjectileBase._spawn_hit_effect() (aktuelle inline
     CPUParticles2D-Lösung) durch die EffectBase-basierte Lösung
     ersetzen, sobald die Impact-Effect-Config beim Projektil ankommt.
     Falls das im selben Auftrag nicht sauber lösbar ist: alte Lösung
     als dokumentierten Fallback (Kommentar im Code) bestehen lassen,
     nicht kommentarlos parallel laufen lassen.

6. HUD/BuildMenu umstellen: mg_turm.tres wird neue
   starter_tower_config, MgTurm.tscn neue starter_tower_scene. Der
   bisherige Legacy-Starter-Turm (Bogenschützen-Nest) wird aus dem
   BuildMenu entfernt, die Dateien bleiben aber vorerst im Repo (volle
   Entfernung erst nach deiner expliziten Freigabe, nicht Teil dieses
   Auftrags).

7. GDD 5.2 und STATUS.md aktualisieren: MG-Turm ist jetzt aktiver
   Starter-Turm nach neuer Sockel/Turret-Architektur, EffectBase-System
   ist jetzt Ist-Zustand (nicht mehr nur geplant).

8. Committen mit deutscher Commit-Message und pushen (CLAUDE.md-Regel).

Bei Widersprüchen zwischen diesem Auftrag und dem Ist-Zustand im Code:
nachfragen, nicht raten.
```

**Test-Checkliste nach Schritt 5 (manuell in Godot):**

- [ ] BuildMenu zeigt MG-Turm textbasiert mit korrektem Namen und
      Kosten. Icon-Datei existiert im UI-Icons-Ordner, wird aber noch
      nicht gerendert.
- [ ] Turm ist auf einem TowerSlot platzierbar
- [ ] Sockel steht fest, Turret rotiert sichtbar und flüssig zum nächstgelegenen Gegner in Reichweite
- [ ] Turret kehrt in Ruheposition (0°) zurück bzw. verfolgt weiter, wenn kein Ziel mehr da ist (IDLE-Verhalten korrekt)
- [ ] Beim Schuss: Mündungsfeuer erscheint exakt an der Mündung und rotiert mit dem Turret mit
- [ ] Projektil fliegt sichtbar vom Mündungspunkt zum Ziel
- [ ] Beim Einschlag: Impact-Effekt (über EffectBase) erscheint, Gegner nimmt sichtbar Schaden (HP sinkt bzw. Hit-Flash falls vorhanden)
- [ ] Falls Fire-Sheet vorhanden: Recoil-Animation läuft ruckelfrei ab
- [ ] Turm lässt sich verkaufen, Gold wird korrekt gutgeschrieben
- [ ] Keine Console-Errors oder -Warnings während des gesamten Tests
- [ ] Bestehende Wellen des Prototype-Levels weiterhin normal spielbar (keine Regression durch den Umbau)

**Freigabe-Bedingung:** Erst wenn alle Punkte oben grün sind, gilt
Schritt 5 als abgeschlossen und STATUS.md wird entsprechend aktualisiert
(danach: Sync im Claude-Projekt triggern, bevor Schritt 6 angegangen wird).

---

## 5. Definition of Done

Gemäß Abschnitt 11 der Architektur-Doku, konkret für dieses Paket:

- [ ] Alle Bestandteile aus Abschnitt 1 existieren am richtigen Ort mit korrektem Namen
- [ ] Alle QA-Punkte aus Abschnitt 3 pro Bild abgehakt, MuzzlePoint-Offset eingetragen
- [ ] EffectBase-System (Abschnitt 4, Punkt 4) implementiert und funktionsfähig
- [ ] Godot-Integration nach Test-Checkliste aus Abschnitt 4 vollständig grün
- [ ] Committet und gepusht (deutsche Commit-Message)
- [ ] Dieses Paket-Dokument auf Status „Fertig" gesetzt
- [ ] STATUS.md aktualisiert (MG-Turm ist neuer Starter-Turm, EffectBase ist Ist-Zustand)
- [ ] Projekt-Sync im Claude-Projekt getriggert, bevor mit Schritt 6 (Level-Hintergrund-Einbau) begonnen wird
