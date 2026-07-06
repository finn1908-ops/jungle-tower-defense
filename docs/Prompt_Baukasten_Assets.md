# Prompt-Baukasten: ChatGPT Image Assets (Jungle Tower Defense)

So benutzt du das: Kopiere den Fixen Rahmen, ersetze die drei markierten
Stellen, fertig ist der Prompt für ein neues Asset.

## Fixer Rahmen (unverändert übernehmen)

```
Erstelle ein 2D-Game-Asset im Stil "Military Jungle Tower Defense":
[[OBJEKT-BESCHREIBUNG]]

Rendering-Stil: FLACHES, SAUBERES Cartoon-Cel-Shading. Keine realistische
Materialdarstellung – keine Kratzer, keine Abnutzungsspuren, kein
Rost/Schmutz, keine hochauflösend gezeichneten Einzelschrauben.
Schattierung: 2-3 flache Farbstufen pro Fläche (Grundfarbe, ein
Schatten-Ton, ein Glanz-Ton), keine weichen Verläufe.

Perspektive: Top-Down, leicht isometrisch, zur Kamera ausgerichtet.

Farbpalette: militärisches Grün/Erdton als Basis, mit [[AKZENTFARBE]]
als Akzentfarbe. Hoher Kontrast, klare Silhouette, gut lesbar in kleiner
Darstellungsgröße auf einer Spielkarte.

[[SERIE-HINWEIS]]

Freistehendes Objekt, transparenter Hintergrund, kein Text, kein
Wasserzeichen.
```

## Die drei Variablen

- **[[OBJEKT-BESCHREIBUNG]]** – was ist es, welche Teile hat es?
  Beispiel: "ein Flammenwerfer-Geschützturm aus Metall und Sandsäcken, mit
  Feuerdüse, Treibstofftank und Schlauch am Sockel"
- **[[AKZENTFARBE]]** – passend zum Thema des Objekts wählen:
  - Feuer/Flamme → Orange
  - Elektro/Tesla → Blau/Cyan
  - Gift → Neon-Grün
  - Rakete/Explosion → Rot
  - Standard/neutral → Stahl-Grau
- **[[SERIE-HINWEIS]]** – nur bei Türmen einfügen, bei Gegnern/Fahrzeugen
  weglassen:
  ```
  Einheitliche Sockel-Bauweise, passend zu einer Serie aus MG-Turm,
  Raketenturm, Mörser, Tesla-Turm und Radar-Turm.
  ```

## Ausgefülltes Beispiel (Bogenschützen-Turm, aus dem GDD)

```
Erstelle ein 2D-Game-Asset im Stil "Military Jungle Tower Defense":
ein Bogenschützen-Nest, eine erhöhte Holzplattform mit Schießscharte,
bemannt mit einem Soldaten mit Scharfschützengewehr.

Rendering-Stil: FLACHES, SAUBERES Cartoon-Cel-Shading. Keine realistische
Materialdarstellung – keine Kratzer, keine Abnutzungsspuren, kein
Rost/Schmutz, keine hochauflösend gezeichneten Einzelschrauben.
Schattierung: 2-3 flache Farbstufen pro Fläche (Grundfarbe, ein
Schatten-Ton, ein Glanz-Ton), keine weichen Verläufe.

Perspektive: Top-Down, leicht isometrisch, zur Kamera ausgerichtet.

Farbpalette: militärisches Grün/Erdton als Basis, mit Stahl-Grau als
Akzentfarbe. Hoher Kontrast, klare Silhouette, gut lesbar in kleiner
Darstellungsgröße auf einer Spielkarte.

Einheitliche Sockel-Bauweise, passend zu einer Serie aus MG-Turm,
Raketenturm, Mörser, Tesla-Turm und Radar-Turm.

Freistehendes Objekt, transparenter Hintergrund, kein Text, kein
Wasserzeichen.
```

## Sprite-Sheet-Vorlage für animierte Einheiten (Gehzyklus, 3 Posen)

Diese Vorlage entstand nach mehreren Fehlversuchen beim Dschungel-Späher
und hat sich bewährt. Für jede neue animierte Einheit (Gegner, Held,
später ggf. Türme mit Bewegung) diesen Ablauf nutzen.

### Wichtigste Regel: IMMER im selben ChatGPT-Chat weiterarbeiten

Sobald ein Chat einmal ein Ergebnis geliefert hat, das zum Style Guide
passt, werden ALLE weiteren Prompts für dieselbe Asset-Serie in genau
diesem Chat fortgesetzt – niemals in einem neuen Chat, auch nicht
innerhalb desselben ChatGPT-Projekts. Grund: ChatGPT Image nutzt den
bisherigen Bildverlauf als Stil-Anker. Ein neuer Chat startet ohne dieses
Gedächtnis und driftet leicht vom Stil ab, selbst bei identischem
Text-Prompt.

### Basis-Prompt für ein 3-Posen-Sprite-Sheet

```
Erstelle ein 2D-Game-Sprite-Sheet im Stil "Military Jungle Tower Defense":
[[OBJEKT-BESCHREIBUNG]]

KAMERA/PERSPEKTIVE (wichtigster Punkt): TOP-DOWN, leicht isometrisch – die
Kamera schaut von SCHRÄG OBEN auf den Charakter. NICHT seitliche
Profilansicht wie in einem Plattformer/Runner-Spiel. Der Charakter läuft
schräg nach vorne-unten in Richtung Kamera, nicht seitlich durchs Bild.

RENDERING-STIL (strikt einhalten): FLACHES, SAUBERES Cartoon-Cel-Shading.
Nur 2-3 flache Farbstufen pro Fläche – KEINE weichen Farbverläufe, KEINE
realistischen Texturen, KEINE Abnutzungsspuren/Kratzer/Rost. Waffen/
Werkzeuge als einfache Silhouette ohne Anbauteile, keine
Einzelschrauben.

Zeige GENAU 3 Posen NEBENEINANDER in einer Reihe, gleicher Abstand, gleiche
Größe, gleicher Hintergrund (transparent), gleiche Kamera-Distanz,
IDENTISCHE Figur in allen 3 Posen (keine Variation der Identität):
Pose 1 (links): linkes Bein leicht vorne, rechtes Bein leicht zurück.
Oberkörper, Arme und Haltung bleiben in ALLEN 3 Posen exakt gleich
positioniert – nur die Beine bewegen sich.
Pose 2 (Mitte): beide Beine mittig/parallel, Übergangspose. Oberkörper/
Arme identisch zu Pose 1 und Pose 3.
Pose 3 (rechts): rechtes Bein leicht vorne, linkes Bein leicht zurück –
spiegelbildlich zu Pose 1 NUR bei den Beinen. Oberkörper/Arme NICHT
gespiegelt, identisch zu Pose 1 und Pose 2.

Farbpalette: militärisches Grün/Erdton als Basis, mit [[AKZENTFARBE]] als
Akzentfarbe. Hoher Kontrast, klare Silhouette, gut lesbar in kleiner
Darstellungsgröße.

Freistehende Figur, transparenter Hintergrund, kein Text, kein
Wasserzeichen, keine Rahmen oder Trennlinien zwischen den 3 Posen.
```

Falls eine Pose nach dem ersten Versuch nicht stimmt (z. B. falsches Bein
vorne) NICHT neu generieren – das riskiert, den gerade gefundenen guten
Stil zu verlieren. Stattdessen im selben Chat gezielt nachbessern:

```
Bearbeite das gerade erstellte Sprite-Sheet: Behalte Pose [X] und Pose [Y]
exakt Pixel-identisch bei, unverändert.

Ändere AUSSCHLIESSLICH Pose [Z]: [genaue Beschreibung der gewünschten
Änderung, z. B. "Vertausche die Beinstellung, sodass das GEGENÜBERLIEGENDE
Bein vorne ist"].

Oberkörper, Arme, Kopf, Farben und Stil bleiben in Pose [Z] exakt identisch
zu den anderen Posen. Es ändert sich ausschließlich [betroffener Teil].
```

### Nachbearbeitung – WICHTIG, auch wenn der Hintergrund schon "transparent" aussieht

ChatGPT Image erzeugt oft ein Karo-Muster, das wie Transparenz aussieht,
technisch aber ein normales Bild OHNE echten Alpha-Kanal ist (reines RGB).
Photopea-Schritt ist deshalb IMMER Pflicht, auch wenn es im Vorschaubild
schon transparent wirkt:

1. In Photopea öffnen (photopea.com).
2. Magic Wand → Hintergrund auswählen → Entf-Taste.
3. Als PNG exportieren (Alpha-Kanal wird dabei automatisch mit
   gespeichert).

ZUSÄTZLICH beim Zuschneiden der 3 Posen beachten: Nicht einfach in gleiche
Drittel schneiden – die Posen stehen im generierten Bild oft
unterschiedlich weit vom Rand entfernt. Stattdessen jede Pose einzeln
freistellen und BODENBÜNDIG (Fuß-Referenzpunkt an derselben Stelle in
jedem Frame) neu anordnen, bevor die 3 Frames wieder zu einem Sheet
zusammengesetzt werden. Sonst "springt" die Figur beim Abspielen der
Animation sichtbar hin und her, statt flüssig zu laufen.
