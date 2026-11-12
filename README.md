# IC Immobilien Gruppe – strukturierte statische Website

Dies ist eine aufgeräumte Version der statischen IC-Website für Netlify.

Das Design wurde nicht neu gebaut. Die bestehenden Designbausteine, CSS-Regeln und Bild-URLs werden weiterverwendet. Optimiert wurde vor allem die Struktur, damit Unterseiten künftig einfacher ergänzt werden können.

## Relaunch V7 – Bewegungsschicht

Das modernisierte Erscheinungsbild („Blueprint in Bewegung“) liegt in `public/assets/css/relaunch-v7-motion.css` und `public/assets/js/relaunch-v7-motion.js`. Details und Einbindung: `docs/07-relaunch-v7-bewegung.md`.

## Wichtigste Struktur

- Startseite: `public/index.html`
- Leistungsübersicht: `public/leistungen/index.html`
- Leistungsseiten: `public/leistungen/<leistung>/index.html`
- Objektübersicht: `public/objekte/index.html`
- Objektseiten: `public/objekte/<objekt>/index.html`
- Niederlassungsübersicht: `public/niederlassungen/index.html`
- Niederlassungen: `public/niederlassungen/<stadt>/index.html`
- Gemeinsames CSS: `public/assets/css/main.css`
- Gemeinsames JavaScript: `public/assets/js/main.js`

## Enthaltene Leistungsseiten

- Property Management
- Asset Management
- Projektsteuerung
- Center Management
- Vermietung
- Investment
- Fondsmanagement

## Neue Unterseiten anlegen

Vorlagen liegen unter:

```text
templates/leistung/index.html
templates/objekt/index.html
templates/niederlassung/index.html
```

Jede neue öffentliche Seite wird als eigener Ordner mit `index.html` unter `public/` angelegt.

## Lokal testen

```bash
npm install
npm start
```

Dann öffnest du die lokale Adresse, die im Terminal angezeigt wird.

## Deployment auf Netlify

Netlify soll weiterhin nur den Ordner `public/` veröffentlichen.

Build settings:

- Build command: leer lassen oder `npm run build`
- Publish directory: `public`

## Hinweis

Die Seiten `Impressum`, `Datenschutz` und `Barrierefreiheit` sind weiterhin Platzhalter und sollten rechtlich final geprüft werden.
