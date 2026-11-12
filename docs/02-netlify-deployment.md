# 02 – Deployment auf Netlify

## Variante A: Schnelltest

Den Ordner `public/` per Netlify Drop hochladen.

## Variante B: Professionell

1. Projekt in GitHub/GitLab/Bitbucket speichern.
2. Netlify mit dem Repository verbinden.
3. Publish Directory auf `public` setzen.
4. Bei jeder Änderung committen und pushen.
5. Netlify deployt automatisch.

## netlify.toml

```toml
[build]
  publish = "public"
  command = ""
```

Wenn später Astro, Vite oder Eleventy genutzt wird, ändert sich das meist zu:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```
