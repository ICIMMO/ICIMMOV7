# Relaunch V7 – „Blueprint in Bewegung“

Die Gestaltungs- und Bewegungsschicht liegt in genau zwei Dateien und wird auf jeder Seite als Letztes geladen:

- `public/assets/css/relaunch-v7-motion.css`
- `public/assets/js/relaunch-v7-motion.js`

Texte, Struktur und Corporate Design (IC-Blau `#06489A`, Wortmarke, Schriften, linksbündige Ausrichtung) bleiben unverändert.
Das Skript hüllt Überschriften lediglich wortweise in `<v7-w>`-Elemente und lässt Kennzahlen hochzählen – der Endwert ist immer der Originaltext.

## Einbindung in neue Seiten

Im `<head>`, nach allen anderen Stylesheets:

```html
<!-- Relaunch V7: Bewegungsschicht -->
<script>(function(d){d.className+=" v7-js";try{if(location.pathname==="/"&&!sessionStorage.getItem("v7-intro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)d.className+=" v7-intro"}catch(e){}})(document.documentElement)</script>
<link rel="stylesheet" href="/assets/css/relaunch-v7-motion.css?v=20261112-1">
```

Vor `</body>`, nach allen anderen Skripten:

```html
<script defer src="/assets/js/relaunch-v7-motion.js?v=20261112-1"></script>
```

Die Vorlagen unter `templates/` enthalten beides bereits.

## Was die Schicht tut

| Baustein | Wo | Hinweis |
| --- | --- | --- |
| Auftakt-Vorhang mit Wortmarke | Startseite | einmal pro Browser-Sitzung |
| Hero: Lichtflächen, Blueprint-Linien, Kamerafahrt, Cursor-Licht | alle Seiten mit Hero | neue Hero-Klassen in `HERO_SELECTOR` (JS) ergänzen |
| Überschriften Wort für Wort | alle `h1`/`h2` in `<main>` | |
| Gestaffeltes Einblenden von Rastern und Bildern | alle Seiten | automatisch für Grid-/Flex-Raster unterhalb der Falz |
| Kennzahlen zählen hoch | alle Seiten | Indizes (01, 02 …) und Jahreszahlen sind ausgenommen |
| Lebenszyklus läuft selbstständig | Startseite | stoppt bei der ersten Interaktion |
| Scroll-Fortschritt, Glas-Header, Button-Effekte, Seitenübergänge | alle Seiten | |

## Barrierefreiheit und Abschalten

- Bei „Bewegung reduzieren“ (`prefers-reduced-motion`) bleibt alles statisch.
- Alle Zusatz-Elemente sind dekorativ (`aria-hidden`).
- Komplett abschalten: die drei oben genannten Zeilen aus einer Seite entfernen.

## Nebenbei korrigiert

- `/niederlassungen/` zeigte keinen Inhalt (Seite nutzt `.service-page`, trägt aber `body.route-nl`).
- Der Zahlenblock der Startseite stand ohne Seitenrand und damit außerhalb der Seitenflucht.
