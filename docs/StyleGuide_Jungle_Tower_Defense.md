# Style Guide: Jungle Tower Defense (Military Jungle)

**Status:** v0.1 – aus dem visuellen Referenz-Board abgeleitet

---

## Visual Identity

Stilisierte 2D-Grafik mit klaren Formen und starken Silhouetten. Militärisch,
robust und funktional, eingebettet in dichten Dschungel. Lesbarkeit und
Gameplay stehen immer an erster Stelle vor reiner Optik.

## Kernwörter

Militärisch · Dschungel · Robust · Klar lesbar · Funktional · Heroisch

## Perspektive

Top-Down, leicht isometrisch, mit orthogonaler Logik. Einheiten und Türme
sind zur Kamera ausgerichtet (nicht frei drehbar).

## Terrain & Boden

Erdpfad, Gras, Fels/Stein, Wasser, Holzbrücke – klar unterscheidbare
Texturen, damit der Pfad auch bei dichter Vegetation gut lesbar bleibt.

## Details & Dekoration

Felsen, Palmen, Büsche/Farne, blühende Sträucher – als Randbepflanzung,
nicht auf dem eigentlichen Pfad.

## Einheiten – Feinde (Referenz-Roster)

Soldat (Gewehr), Soldat schwer (Raketenwerfer), Schild-Soldat,
Raketen-Soldat, Jeep/Fahrzeug. Alle mit sichtbarer Lebensleiste über dem
Kopf.

## Türme (Referenz-Roster)

MG-Turm, Raketenturm, Mörser/Kanone, Tesla/Elektro-Turm,
Radar/Sniper-Dish-Turm. Einheitliche Sockel-Bauweise über alle Türme hinweg,
damit sie als zusammengehörige Serie erkennbar sind.

## Umgebung / Props

Wachturm, Sandsack-Stapel, Kisten, Zelt, Palme, Stern-Markierung, Fass –
für Set-Dressing rund um den Pfad.

## UI-Stil

- **HUD oben:** Herzen (Leben), Münzen (Gold), Totenkopf-Icon (Wellen-Zähler)
- **Steuerung:** Play / Schnellvorlauf / Pause, dazu ein auffälliger
  "Welle starten"-Button (gelb/orange, sticht klar hervor)
- **Turm-Info-Panel:** Name, Level, Schaden, Feuerrate, Reichweite,
  Ziel-Typ, Upgrade-Button (grün), Verkaufen-Button (rot)

## Icons (Referenz-Set)

Munition, Explosion/Schaden, Ziel/Reichweite, Münze, Herz, Werkzeug
(Reparatur/Upgrade), Fläschchen (Buff/Debuff), Schild, Rang-Abzeichen,
Totenkopf, Fallschirm, Kiste, Medaille, Kalender, Einkaufswagen, Zahnrad
(Einstellungen)

## Effekte

Mündungsfeuer, Explosion, Rauch, Funken/Feuer, Elektro-Blitz

## Farbkontrast & Lesbarkeit

Hoher Kontrast zwischen Gegnern (warme Töne, rot/orange-Akzente) und
Spieler-Elementen (kühlere/neutrale Töne). Klare Silhouetten müssen auch
vor dichtem Dschungel-Hintergrund sofort erkennbar sein – das ist
wichtiger als Detailtreue.

---

## Rendering-Stil (finalisiert nach Asset-Test)

Entscheidend für konsistente Assets: **flaches Cartoon-Cel-Shading**, nicht
realistisch gerendert.

- 2-3 flache Farbstufen pro Fläche (Grundfarbe, ein Schatten-Ton, ein
  Glanz-Ton) – keine weichen Verläufe, keine fotorealistischen Reflexionen
- **Keine** Abnutzungsspuren: keine Kratzer, kein Rost, kein Schmutz
- Schrauben/Nieten als einfache angedeutete Kreise, nicht einzeln mit
  Glanzlicht/Schatten ausmodelliert
- Alle inhaltlichen Objektteile (Tank, Schlauch, Ventil, Warnmarkierung
  etc.) bleiben erhalten – die Reduktion betrifft den Rendering-Stil,
  nicht den Objektumfang

**Referenz-Prompt-Baustein für alle zukünftigen Assets:**
```
Rendering-Stil: FLACHES, SAUBERES Cartoon-Cel-Shading. Keine realistische
Materialdarstellung – keine Kratzer, keine Abnutzungsspuren, kein
Rost/Schmutz, keine hochauflösend gezeichneten Einzelschrauben.
Schattierung: 2-3 flache Farbstufen pro Fläche, keine weichen Verläufe.
```
Dieser Baustein gehört in jeden ChatGPT-Image-Prompt ab jetzt.

## Offen / noch zu ergänzen

- Konkrete Hex-Farbwerte für die Kernpalette
- Schriftart(en) für UI
- Referenzbilder für die erweiterten Gegner/Türme aus Abschnitt 5.5 des GDD
