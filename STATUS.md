Aktueller MVP-Scope: 1 Turm (Bogenschützen-Nest), 1 Gegner (Dschungel-Späher), 1 Held (Dschungel-Wächter), 1 Level.



Bestätigte Architektur-Entscheidungen (verbindlich, nicht erneut zur Diskussion stellen):

\- WaveManager ist KEIN Autoload-Singleton, sondern ein normaler Node innerhalb jeder Level-Szene (scripts/systems/WaveManager.gd). Grund: Wellendaten sind pro Level unterschiedlich.

\- MVP-Content-Fokus: Bogenschützen-Nest (Turm) und Dschungel-Späher (Gegner) sind die EINZIGEN Typen, die aktuell animiert/fertiggestellt werden. Dornen-Kaserne, Giftschleuder, Wildschwein-Rammler, Stein-Panzerkäfer existieren bereits als Szenen/Configs, bleiben aber unangetastet bis der Animationsansatz bestätigt ist.



Offene Entscheidungen: (leer)



Letzter bestätigter Stand: Animationsansatz für Schritt 5 wird gerade festgelegt (3 Optionen in Prüfung).

