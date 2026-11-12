# Neue Leistungsseite anlegen

1. Neuen Ordner unter `public/leistungen/` erstellen, zum Beispiel:

```text
public/leistungen/esg-consulting/
```

2. Die Vorlage kopieren:

```text
templates/leistung/index.html
```

3. Als neue Seite einfügen:

```text
public/leistungen/esg-consulting/index.html
```

4. Platzhalter ersetzen:

- `{{LEISTUNG}}`
- `{{SLUG}}`
- `{{META_DESCRIPTION}}`
- `{{KICKER}}`
- `{{H1_HTML}}`
- `{{HERO_TEXT}}`
- `{{QUOTE}}`
- `{{LEAD_TEXT}}`

5. Link ergänzen in:

- `public/leistungen/index.html`
- optional auf der Startseite `public/index.html`
- `public/sitemap.xml`

Wichtig: Design nicht in der Unterseite ändern. Falls ein neues Layout-Element nötig ist, zuerst in `public/assets/css/main.css` ergänzen.


## Bestehende Leistungsseiten

- Property Management
- Asset Management
- ESG
- Projektsteuerung
- Center Management
- Vermietung
- Investment
- Fondsmanagement
