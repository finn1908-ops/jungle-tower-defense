# Game Design Document: Jungle Tower Defense

**Status:** Entwurf v0.1 – Grundlage für MVP-Entwicklung
**Engine:** Godot 4.7 (GDScript, Mobile-Renderer)
**Zielplattform:** iOS App Store (MVP), spätere Plattformen offen

---

## 1. Vision

Ein Tower-Defense-Spiel im Stil von Kingdom Rush, angesiedelt in einer
Dschungel-Welt. Fester Pfad, taktische Turm-Platzierung, Nahkampf-Blocker-
Einheiten und Helden mit aktiven Fähigkeiten. Langfristiges Ziel: ein großes,
umfangreiches Spiel mit vielen Themenwelten, Türmen, Gegnern und Helden. Der
MVP ist bewusst klein geschnitten, um den Core-Loop früh spielbar und
testbar zu machen.

**Nicht-Ziele für den MVP:** Mehrspieler, Level-Editor, Meta-Progression
über mehrere Spielstände hinweg, Monetarisierung (siehe Abschnitt 7).

---

## 2. Genre & Referenz

- Genre: Tower Defense mit Hero-Mechanik
- Referenz: Kingdom Rush (Ironhide Game Studio)
- Kernunterschied zu reinem TD: Spieler kann direkt eingreifen (Held,
  Nahkampf-Blocker), nicht nur Türme platzieren und zusehen

---

## 3. Core Loop

1. Level starten → Pfad und Turm-Slots sind sichtbar
2. Vor/während der Wellen: Türme auf freie Slots setzen, upgraden oder verkaufen
3. Held aktiv einsetzen: positionieren, Fähigkeit einsetzen (Cooldown-basiert)
4. Welle läuft: Gegner laufen den Pfad entlang, Türme/Held/Blocker bekämpfen sie
5. Gegner, die durchkommen, kosten Leben (Herzen)
6. Nach letzter Welle: Level-Ergebnis (1-3 Sterne je nach verbliebenen Leben)
7. Gold aus dem Level fließt in permanente Freischaltungen (spätere Level, Upgrades)

---

## 4. Spielmechaniken

### 4.1 Pfad & Platzierung
- Fester, vordefinierter Pfad pro Level (kein freies Pathing)
- Feste Turm-Slots neben dem Pfad (keine freie Platzierung überall)
- Manche Slots sind nur für bestimmte Turmtypen geeignet (spätere Erweiterung,
  im MVP: alle Slots universell)

### 4.2 Wirtschaft
- Eine Währung: **Gold**
- Gold-Einnahmen: getötete Gegner, Wellen-Abschluss-Bonus
- Ausgaben: Turm bauen, Turm upgraden (Stufe 1→2→3)
- Türme können verkauft werden (Teilerstattung, z. B. 70% des investierten Golds)

### 4.3 Leben/Herzen
- Start mit z. B. 20 Herzen pro Level
- Jeder durchgekommene Gegner kostet 1 Herz (stärkere Gegner ggf. mehr)
- 0 Herzen = Level verloren

### 4.4 Wellen-System
- Jedes Level besteht aus mehreren Wellen (MVP: 8-12 Wellen pro Level)
- Wellen bestehen aus Mischungen der 3 MVP-Gegnertypen, Schwierigkeit steigt
- Optional: "Wellen vorzeitig starten"-Button für erfahrene Spieler (Bonus-Gold)

### 4.5 Sterne-Bewertung
- 3 Sterne: keine Herzen verloren
- 2 Sterne: Herzen verloren, aber ≥ 50% übrig
- 1 Stern: Level geschafft, aber < 50% Herzen übrig

---

## 5. MVP-Inhalt

### 5.1 Level (3-5 für MVP)
Alle im Dschungel-Setting, unterschiedliche Pfadformen (z. B. Spirale,
Zickzack, Kreuzung), steigende Schwierigkeit.

### 5.2 Turmtypen (MVP-Fokus: 1 Turm, 2 weitere bereits vorbereitet)

**Aktualisiert nach Einführung der Stufe-1-Animation:** Um die
Content-Produktion nicht auf 3 Türme gleichzeitig zu verteilen,
konzentriert sich der aktuelle MVP-Durchlauf auf **Bogenschützen-Nest**.
Dornen-Kaserne und Giftschleuder sind technisch bereits als Szenen/Configs
angelegt (siehe Architektur-Dokument) und bleiben vorerst unverändert im
Projekt bestehen – sie werden nach Bestätigung des Animationsansatzes
regulär weitergeführt, nicht neu gebaut.

| Turm | Typ | Rolle | Beschreibung |
|---|---|---|---|
| **Bogenschützen-Nest** *(MVP-Fokus)* | Fernkampf, Einzelziel | Grundschaden, DPS-Standard | Schnelle Feuerrate, mittlerer Schaden auf ein Ziel |
| **Dornen-Kaserne** *(vorbereitet, pausiert)* | Nahkampf-Blocker | Pfad blockieren | Spawnt 2-3 Kämpfer, die auf dem Pfad stehen und Gegner aufhalten; Kämpfer können respawnen |
| **Giftschleuder** *(vorbereitet, pausiert)* | Fläche, Damage-over-Time | Gegen Gruppen | Trifft mehrere Gegner in einem Radius, Gift-Schaden über Zeit |

Jeder Turm: 3 Ausbaustufen (Level 1-3), Kosten und Werte steigend.

### 5.3 Gegnertypen (MVP-Fokus: 1 Gegner, 2 weitere bereits vorbereitet)

Gleiches Prinzip wie bei den Türmen: **Dschungel-Späher** ist der
Gegnertyp, an dem die Stufe-1-Animation (Beine separat, Spiegelung nach
Pfadrichtung) zuerst umgesetzt und getestet wird. Wildschwein-Rammler
und Stein-Panzerkäfer bleiben als funktionale, aber unanimierte
Platzhalter bestehen, bis der Ansatz bestätigt ist.

| Gegner | Rolle | Beschreibung |
|---|---|---|
| **Dschungel-Späher** *(MVP-Fokus)* | Swarmer | Schnell, wenig HP, kommt oft in Gruppen |
| **Wildschwein-Rammler** *(vorbereitet, pausiert)* | Rusher | Mittleres Tempo, wird schneller je weniger HP übrig |
| **Stein-Panzerkäfer** *(vorbereitet, pausiert)* | Tank | Langsam, sehr hohe HP, hoher Schaden an Herzen falls durchgekommen |

### 5.4 Held (1 für MVP)
**Dschungel-Wächter** – Nahkampf-Held, wird vom Spieler frei auf dem Pfad
platziert, kämpft automatisch gegen nahe Gegner.
- Aktive Fähigkeit: Flächenschlag (Cooldown-basiert, Schaden im Umkreis)
- Steigt über Kämpfe im Level Erfahrung/Level (Reset pro Level oder
  persistent – **offene Frage, siehe Abschnitt 8**)

### 5.5 Erweitertes Roster (Roadmap nach MVP, bereits akzeptiert)

**Gegner:** Schildträger, Kampfhund-Meute, Wildschwein-Reiter,
Flammenwerfer-Soldat, Quad-Bike-Trupp, Dschungel-Scharfschütze (Gegner,
beschießt Türme), Kampfpanzer, Kampfhubschrauber (Luft-Einheit),
Dschungel-Kriegsherr (Boss)

**Türme:** Flammenwerfer-Turm, Flugabwehr-Turm (einzige Antwort auf
Helikopter), Tarn-Falle, Artillerie (indirekter Fernschuss)

---

## 6. Kunst & Präsentation

- Look: stilisiert, farbenfroh, Dschungel-Palette (Grün-/Erdtöne mit
  Akzentfarben pro Fraktion) – **Style Guide folgt als eigenes Dokument**
- Animation: **Gestuftes Vorgehen.** Stufe 1 (jetzt, Content-Produktion):
  3-Frame-Ganzkörper-Spritesheet als Walk-Loop (AnimatedSprite2D),
  horizontale Spiegelung je nach Pfadrichtung. Der frühere Ansatz
  "Oberkörper statisch + Beine separat" wurde nach Praxistest verworfen.
  Stufe 2 (Polish-Phase, Schritt 7): vollständiges Skelett-Rig über Godot
  Skeleton2D/AnimationPlayer mit mehrteiligen Körper-Layern. Diese
  Entscheidung gilt automatisch für alle betroffenen Phasen bis zum
  Polish, ohne erneute Abstimmung nötig.
- Level-Ambiente: Wind-Shader für Bäume/Vegetation (siehe Architektur-Dokument)
- UI: klar lesbar, touch-freundlich (Mindestgröße Buttons für Mobile)

---

## 7. Monetarisierung

**Noch offen – bewusst nicht für den MVP entschieden.** Optionen für später:
Premium-Kauf, Free-to-Play mit IAP (Level-Packs, Kosmetik), Werbung. Diese
Entscheidung sollte vor dem tatsächlichen Store-Release getroffen werden,
beeinflusst aber die MVP-Architektur nicht wesentlich.

---

## 8. Offene Fragen (zu klären, bevor die jeweiligen Systeme gebaut werden)

- Heldenprogression: pro Level zurückgesetzt oder permanent über das ganze Spiel?
- Wie viele Slots pro Level (fix pro Level oder Formel)?
- Freischalt-Logik zwischen Leveln (linear oder Weltkarte wie Kingdom Rush)?
- Zielgruppe für Schwierigkeitsgrad (casual vs. fordernd)?

---

## 9. Technische Eckdaten (Verweis)

Details siehe separates **Architektur-Dokument** (als nächster Schritt zu
erstellen): Systeme wie TowerManager, WaveManager, EconomySystem,
HeroController, Datenstruktur für Turm-/Gegner-Configs, Speicherformat für
Level-Fortschritt.

---

## 10. Kreative Spielmechaniken (Vision für das vollständige Spiel)

Nicht Teil des MVP, aber die langfristige Vision, die das Spiel von einem
reinen Kingdom-Rush-Klon abhebt:

- **Verzweigte Turm-Upgrades (Bloons-TD-Element):** Ab Stufe 2 wählt jeder
  Turm einen von zwei Pfaden (z. B. MG-Turm → "Schnellfeuer"/DPS oder
  "Durchschlag"/Piercing gegen Reihen)
- **Umwelt-Interaktion:** Brennbare Vegetation – Flammenwerfer-Turm entzündet
  Gras, das sich ausbreitet, Gegner schädigt, aber auch eigene Blocker
  gefährden kann
- **Kommando-Fähigkeiten:** Cooldown-basierte Spezialfähigkeiten unabhängig
  von Türmen – Luftschlag, Aufklärung (zeigt nächste Welle vorab),
  Artillerie-Salve
- **Schrott-Ressource:** Zerstörte Fahrzeuge hinterlassen "Schrott" als
  zweite Ressource, nur für High-Tier-Ausbaustufen nötig
- **Tarn-Fallen:** Einmalig auslösende, unsichtbare Fallen vor der Welle
  platziert – Dauerschaden (Turm) vs. Einmaleffekt (Falle)
- **Sich verändernde Level:** Dieselbe Karte taucht später verwüstet/
  verändert wieder auf (z. B. nach einer Bossschlacht)
- **Permanente Feldlager-Progression:** Zwischen Leveln freischaltbare,
  global geltende Upgrades (Kingdom-Rush-Heldenprogression trifft
  Bloons-TD-"Monkey Knowledge"-Baum)

Diese Punkte fließen nach und nach ins Architektur-Dokument und die
Post-MVP-Roadmap ein.
