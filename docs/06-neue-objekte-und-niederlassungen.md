# Neue Objekt- oder Niederlassungsseite anlegen

## Neue Objektseite

```text
public/objekte/<objekt-slug>/index.html
```

Als Basis kann `templates/objekt/index.html` verwendet werden.

## Neue Niederlassung

```text
public/niederlassungen/<stadt-slug>/index.html
```

Als Basis kann `templates/niederlassung/index.html` verwendet werden.

Danach jeweils ergänzen:

- Link auf der jeweiligen Übersichtsseite
- optional Link auf der Startseite
- Eintrag in `public/sitemap.xml`
- falls nötig Redirect in `public/_redirects`
