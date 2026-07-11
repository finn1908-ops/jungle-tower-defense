# Pulse – Deine Gesundheits- & Alltags-App (PWA)

Pulse ist eine installierbare Web-App (PWA) für iPhone & Co.: Kalorien, Gewicht,
Schritte, Wasser, Supplemente, Training, Schlaf, Stimmung, Fasten, Wetter,
Kalender, Notizen, Aufgaben, Erinnerungen, Einkaufsliste, Ziele und Wochen-Report –
jede Funktion auf einer eigenen Seite, alles zusammengeführt auf dem Dashboard.

**Alle Daten bleiben lokal auf deinem Gerät** (localStorage). Kein Login, kein Server.
Backup/Wiederherstellung als JSON-Datei über die Einstellungen.

---

## 1. Veröffentlichen (einmalig)

1. Diesen Branch nach `main` mergen.
2. Auf GitHub: **Settings → Pages → Build and deployment → Source: „GitHub Actions"** wählen.
3. Der Workflow `.github/workflows/deploy-health-app.yml` deployt die App automatisch
   bei jedem Push auf `main` (oder manuell über den Tab „Actions" → „Run workflow").
4. Die App ist danach erreichbar unter:
   `https://<dein-github-name>.github.io/jungle-tower-defense/`

## 2. Auf den iPhone-HomeScreen legen

1. Die URL in **Safari** öffnen (wichtig: Safari, nicht Chrome).
2. Teilen-Symbol (Quadrat mit Pfeil) → **„Zum Home-Bildschirm"** → „Hinzufügen".
3. Pulse startet ab jetzt wie eine native App: Vollbild, eigenes Icon, offline nutzbar.

## 3. Schritte automatisch aus Apple Health (einmalig ~5 Min.)

Eine Kurzbefehle-Automation schickt deine Schritte mehrmals täglich an Pulse:

1. App **„Kurzbefehle"** → Tab „Kurzbefehle" → **„+"** (neuer Kurzbefehl).
2. Aktion **„Gesundheitsdaten suchen"**: Typ „Schritte", Zeitraum „Heute",
   in den Aktionsoptionen **„Gruppieren nach: Tag"** aktivieren (ergibt einen Summenwert).
3. Aktion **„URL"**: `https://<deine-app-url>/#/import?steps=` und dahinter die
   Variable **„Gesundheitsdaten"** aus Schritt 2 einfügen.
4. Aktion **„URL öffnen"**. Kurzbefehl benennen, z. B. „Schritte an Pulse".
5. Tab **„Automation"** → „+" → **„Tageszeit"** (z. B. 12:00, 18:00, 22:00 Uhr) →
   „Sofort ausführen" aktivieren → deinen Kurzbefehl wählen.

Beim Ausführen öffnet sich Pulse kurz und übernimmt den Tageswert (mehrfaches
Synchronisieren überschreibt einfach – nichts wird doppelt gezählt).
Die gleiche Anleitung steht auch in der App auf der Schritte-Seite.

## 4. Erinnerungen mit echten Benachrichtigungen

Web-Apps dürfen auf iOS ohne eigenen Server keine Push-Nachrichten senden. Pulse
löst das über den iOS-Kalender: Bei jeder Erinnerung bzw. jedem Termin gibt es
**„→ Kalender"** – das erzeugt eine `.ics`-Datei mit Alarm (auf Wunsch mit täglicher/
wöchentlicher Wiederholung). Einmal „Hinzufügen" tippen, und der iOS-Kalender
benachrichtigt dich zuverlässig, auch wenn Pulse geschlossen ist.

## 5. Technik

- Vanilla HTML/CSS/JS (ES-Module), **kein Build-Step, keine Dependencies**
- SPA mit Hash-Routing, jede Funktion eine eigene Seite (`js/pages/`)
- Design-System mit 3 kompletten Themes (Midnight/Aurora/Titanium) × Hell/Dunkel/Auto
  über CSS-Custom-Properties (`css/app.css`)
- Service Worker: App-Shell offline (cache-first), Wetter network-first
- Wetter: [Open-Meteo](https://open-meteo.com) (kostenlos, kein API-Key),
  GPS mit Stadtsuche-Fallback, letzter Stand offline verfügbar
- Charts & Icons: handgeschriebenes SVG

### Lokal testen

```bash
cd health-app
python3 -m http.server 8123
# → http://localhost:8123
```

Schritte-Import testen: `http://localhost:8123/#/import?steps=8500`
