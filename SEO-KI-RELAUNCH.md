# SEO-, KI- und Relaunch-Hinweise für ic-group.de

Stand: 2026-09-24

## Was in dieser Version technisch umgesetzt ist

- Canonical URLs auf `https://www.ic-group.de/` für alle indexierbaren HTML-Seiten.
- Optimierte Seitentitel und Meta Descriptions ohne grundlegende Umschreibung der redaktionellen Fließtexte.
- Open Graph / Social Preview inklusive lokalem 1200×630-Bild.
- JSON-LD mit `Organization`, `WebSite`, `WebPage`, `BreadcrumbList`, `Service`, `LocalBusiness` und `ItemList`, abhängig vom Seitentyp.
- Acht Niederlassungen maschinenlesbar hinterlegt; Köln wurde als eigene Seite ergänzt.
- XML-Sitemap auf die produktive Domain umgestellt.
- `robots.txt` erlaubt allgemeine Suchmaschinen sowie OAI-SearchBot, GPTBot und ChatGPT-User.
- `llms.txt` als zusätzliche, nicht normative Navigationshilfe für KI-Systeme ergänzt.
- Relaunch-Weiterleitungen für zentrale alte `/dienstleistungen/...`- und `/unternehmen/...`-URLs ergänzt.
- Favicon und maschinenlesbares Logo aus der gelieferten IC-Wortmarke ergänzt.
- Lokale Bilder erhalten, soweit technisch möglich, Größenangaben / Lazy Loading / asynchrones Decoding.
- SEO-Audit über `npm run seo:audit`.

## Unbedingt VOR Go-live durch IC prüfen

1. **Unternehmensdaten:** Telefonnummern, Adressen, Ansprechpartner, Unternehmenszahlen und Managementtexte mit der Geschäftsführung abgleichen. Die strukturierten Standortdaten basieren auf der derzeit öffentlich erreichbaren IC-Website.
2. **Rechtstexte:** `Impressum`, `Datenschutz` und `Barrierefreiheit` sind im gelieferten Projekt noch Platzhalter. Sie sind deshalb bewusst auf `noindex,follow` gesetzt. Vor dem Relaunch rechtlich freigegebene Inhalte einspielen.
3. **Demo-Stellenanzeigen:** Die beiden lokalen Jobdetailseiten enthalten laut Quelltext Beispiel-/Testinhalte. Sie sind deshalb bewusst `noindex`. Nur reale, aktuell offene Stellen dürfen `JobPosting`-Markup erhalten.
4. **Presse/News:** Die bestehende öffentliche Website besitzt wertvolle indexierte Presse- und Fachinhalte, die im neuen Projekt nicht enthalten sind. Diese Inhalte möglichst vor Domain-Umschaltung migrieren und alte Artikel jeweils 1:1 auf die neue Entsprechung weiterleiten. Keine pauschale Weiterleitung aller Presseartikel auf die Startseite.
5. **Englische Seiten:** Die bestehende Domain enthält englischsprachige Seiten. Wenn diese weiter benötigt werden, vor Relaunch übernehmen; andernfalls bewusst entscheiden, wie sie behandelt werden.
6. **Redirect-Inventar:** Export aus Google Search Console / Analytics / Serverlogs mit allen organisch besuchten Alt-URLs erstellen und gegen `public/_redirects` prüfen. Das ist für den Ranking-Erhalt entscheidend.

## Am Tag der Domain-Umschaltung

- HTTPS und Weiterleitung von `ic-group.de` auf `www.ic-group.de` testen.
- `https://www.ic-group.de/robots.txt` und `https://www.ic-group.de/sitemap.xml` live aufrufen.
- Google Search Console: Domain-Property prüfen, neue Sitemap einreichen, Startseite + wichtigste Leistungsseiten mit URL-Prüfung testen.
- Bing Webmaster Tools: Sitemap ebenfalls einreichen.
- Rich Results Test / Schema.org Validator für Startseite, eine Leistungsseite und eine Niederlassung ausführen.
- 301-Weiterleitungen stichprobenartig testen, insbesondere `/dienstleistungen/property-management`, `/dienstleistungen/asset-management`, `/unternehmen` und `/unternehmen/niederlassungen`.
- Keine Staging-/Netlify-Subdomain indexieren lassen; falls öffentlich erreichbar, dort `noindex` oder Passwortschutz einsetzen.

## Langfristig für Google, Bing, ChatGPT & andere KI-Suchen

- Presse-, Projekt- und Referenzinhalte kontinuierlich veröffentlichen und dauerhaft erreichbar halten.
- Externe Erwähnungen/Backlinks aus seriösen Branchenquellen, Partnern, Verbänden und Fachmedien ausbauen.
- Google Business Profiles der acht Standorte aktuell und konsistent halten.
- Unternehmensdaten überall identisch halten (Name, Adresse, Telefon, Domain, Ansprechpartner).
- Search Console monatlich nach Suchbegriffen, Indexierung und 404-Fehlern prüfen.
- Referral-Traffic aus KI-Systemen in Analytics separat auswerten, insbesondere `utm_source=chatgpt.com`.
- Neue echte Stellenanzeigen jeweils mit vollständigem `JobPosting`-Schema veröffentlichen und nach Ablauf entfernen/410 bzw. korrekt weiterleiten.
- Inhalte nicht künstlich für Keywords aufblasen. Neue Seiten nur dann ergänzen, wenn sie eine echte Suchintention beantworten (z. B. konkrete Assetklassen, Referenz-Cases, regionale Leistungen, Fachbeiträge).

## Hinweis zur Canonical-Domain

Diese Version verwendet bewusst `https://www.ic-group.de/`, weil die bestehende Website aktuell unter dem `www`-Host indexiert ist. `https://ic-group.de/*` wird per 301 auf `www` geleitet. Dadurch werden bestehende Signale nicht unnötig auf einen neuen Host verteilt.

## Netlify-Redirect-Hinweis (Fix 2026-09-24)
Netlify normalisiert Trailing Slashes vor der Auswertung von `_redirects`. Deshalb dürfen keine erzwungenen Regeln wie `/karriere /karriere/ 301!` oder `/leistungen/... /leistungen/.../ 301!` verwendet werden: Quelle und Ziel gelten für Netlify als derselbe Pfad und können eine Redirect-Schleife auslösen. Die produktive Konfiguration enthält daher nur echte Alt-zu-Neu-Weiterleitungen; Pretty URLs übernimmt die Slash-Normalisierung.
