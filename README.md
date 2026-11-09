# PrimeConnect — website

Statische website voor [primeconnect.nl](https://primeconnect.nl): Home, Projecten (+ 6 projectpagina's), Over ons (+ Team en Filosofie). Contact loopt via e-mail (info@primeconnect.nl).

De site bestaat uit HTML, CSS, JavaScript en afbeeldingen. Er is geen database, CMS of server-side code nodig; elke webserver die bestanden kan serveren volstaat.

## Snel aan de slag

Vereist: Python 3 (staat standaard op macOS en de meeste Linux-systemen).

```sh
python3 build.py              # HTML opnieuw opbouwen na een wijziging in src/
python3 -m http.server 8765   # lokaal bekijken op http://localhost:8765
python3 build.py zip          # primeconnect-site.zip maken om te uploaden
```

## Hoe het in elkaar zit

De HTML-bestanden in de hoofdmap (`index.html`, `projecten/*.html`, …) worden **gegenereerd**. Pas ze niet direct aan: bewerk de bestanden in `src/` en draai daarna `python3 build.py`.

| Wat | Waar |
|---|---|
| Teksten, afbeeldingen en volgorde van projecten | `src/projects.json` |
| Opbouw van een projectpagina | `src/project.html` |
| Home, Projecten, Over ons, Team, Filosofie | `src/pages/` |
| Head, menu, footer en contactblok (op elke pagina) | `src/partials/` |
| Alle opmaak; kleuren staan bovenaan als variabelen | `assets/css/style.css` |
| Menu, animaties, pixelraster, projectfilter | `assets/js/main.js` |
| Afbeeldingen, video, lettertypes | `assets/img/`, `assets/video/`, `assets/fonts/` |

### Een project toevoegen of aanpassen

1. Zet de afbeelding in `assets/img/` (bij voorkeur `.webp`, ± 1600px breed).
2. Voeg in `src/projects.json` een blok toe of pas er een aan. Kopieer een bestaand project als voorbeeld; `slug` wordt de bestandsnaam (`projecten/<slug>.html`).
3. Draai `python3 build.py`. Home, de projectenpagina en de projectpagina's worden bijgewerkt.

## Online zetten

Draai `python3 build.py zip` en upload de inhoud van `primeconnect-site.zip` naar de webroot van de server, zodat `index.html` in de hoofdmap staat. De zip bevat alleen wat online moet (`*.html`, `projecten/`, `assets/`); `src/` en `build.py` blijven erbuiten.

Aanbevolen op de server:
- HTTPS afdwingen (http → https doorsturen).
- Standaard security-headers aanzetten, als de hosting dat aanbiedt: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`.

Bij elke push naar `main` publiceert de GitHub Actions-workflow (`.github/workflows/pages.yml`) daarnaast een voorbeeldversie op GitHub Pages.

## Externe diensten

Geen. Lettertypes (Archivo, IBM Plex Sans en IBM Plex Mono, SIL Open Font License) worden lokaal gehost, dus er gaan geen bezoekersgegevens naar Google of andere partijen, er zijn geen cookies en er is geen cookiebanner nodig.

## Nog open

- Eigen foto's voor HEMS en 4G-dongle; die gebruiken nu tijdelijk beeld.
