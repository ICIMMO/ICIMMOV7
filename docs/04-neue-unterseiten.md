# 04 – Neue Unterseiten anlegen

## Niederlassung kopieren

1. `templates/niederlassung/` kopieren.
2. Den kopierten Ordner nach `public/niederlassungen/<stadt>/` verschieben.
3. In der `index.html` Platzhalter wie `{{STADT}}`, `{{EMAIL}}`, `{{TELEFON}}` und `{{LEITUNG_NAME}}` ersetzen.
4. Optional den neuen Link in der Standortliste auf der Startseite ergänzen.
5. Neue URL in `public/sitemap.xml` ergänzen.

## URL-Schema

```text
/niederlassungen/<stadt>/
/leistungen/<leistung>/
/objekte/<objekt>/
/jobs/<stelle>/
```

Das Design bleibt zentral in `public/assets/css/main.css`. Wiederkehrendes Verhalten bleibt zentral in `public/assets/js/main.js`.
