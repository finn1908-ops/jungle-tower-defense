\# Jungle Tower Defense – Godot 4.7, GDScript, Mobile-Renderer



Ziel: iOS App Store, Military-Jungle-TD im Kingdom-Rush-Stil mit

Bloons-TD-Elementen (verzweigte Turm-Upgrades, Tarn-Fallen, etc.)



\## Referenzdokumente (im docs/-Ordner)

\- docs/GDD.md

\- docs/StyleGuide.md

\- docs/Architektur.md (folgt)



\## Deine Rolle hier

Umsetzung nach Spezifikation aus den Docs. Keine eigenständigen

Architektur-Entscheidungen treffen – bei Unklarheit nachfragen, nicht raten.



\## Workflow-Kontext

Ich arbeite parallel mit Claude (Chat, Architekt/Spezifikation), Codex

(Review), ChatGPT Image (Assets). Änderungen, die die Architektur betreffen,

zuerst mit dem Chat-Claude abstimmen.



\## Konventionen

Konventionen: siehe docs/Architektur.md Abschnitt 11 (Ordnerstruktur,

Naming-Konventionen, Signal-Kommunikation, Resource-basiertes Balancing)

## Verbindliche Arbeitsregeln

Nach jedem abgeschlossenen Auftrag: alle Änderungen mit einer aussagekräftigen

deutschen Commit-Message committen und zu GitHub pushen (git push). Kein

Auftrag gilt als fertig, bevor gepusht wurde.

Vor jedem Integrationsauftrag oder Asset-Paket mit Codebezug müssen die

betroffenen aktuellen Skripte und Config-Klassen geprüft werden.

Claude/Claude Code darf keine hypothetischen Feldnamen, Szenenstrukturen

oder Dateipfade verwenden. Wenn Dokumentation und Code voneinander

abweichen, nachfragen und nicht raten.

