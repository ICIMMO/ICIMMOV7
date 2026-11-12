# Struktur für Unterseiten

Die Website ist so aufgebaut, dass jede öffentliche Seite unter `public/` als eigener Ordner mit einer `index.html` liegt. Dadurch entstehen saubere URLs ohne Dateiendung.

```text
public/
  index.html

  leistungen/
    index.html
    property-management/
      index.html
    asset-management/
      index.html
    projektsteuerung/
      index.html
    center-management/
      index.html
    vermietung/
      index.html
    investment/
      index.html
    fondsmanagement/
      index.html

  objekte/
    index.html
    sonnenallee-office/
      index.html

  niederlassungen/
    index.html
    duesseldorf/
      index.html

  karriere/
    index.html
  jobs/
    property-manager-gewerbeimmobilien/
      index.html
    buchhalter-finanzbuchhaltung/
      index.html

  ueber-ic/
    index.html
  impressum/
    index.html
  datenschutz/
    index.html
  barrierefreiheit/
    index.html

  assets/
    css/
      base.css
      main.css
    js/
      main.js
```

## Prinzip

- Jede Unterseite bekommt einen eigenen Ordner.
- Die Datei heißt immer `index.html`.
- Gemeinsames Styling bleibt in `public/assets/css/main.css`.
- Gemeinsames JavaScript bleibt in `public/assets/js/main.js`.
- Neue Seiten werden aus `templates/` kopiert.

Beispiel für eine neue Leistungsseite:

```text
public/leistungen/esg-consulting/index.html
```
