# PrimeConnect — nieuw websiteontwerp

Statische site voor [primeconnect.nl](https://primeconnect.nl): Home, Projecten (+ 6 projectpagina's), Over ons en Contact.

## Bekijken

```sh
python3 -m http.server 8765
# → http://localhost:8765
```

## Aanpassen

De HTML in de root wordt **gegenereerd** — bewerk `src/` en draai daarna `python3 build.py`.

- `src/partials/` — head, header, footer en contact-blok (één keer, overal gebruikt)
- `src/pages/` — Home, Projecten, Over ons, Contact
- `src/project.html` + `src/projects.json` — sjabloon en teksten van de projectpagina's
- `assets/css/style.css` — alle opmaak; kleuren uit het logo staan bovenaan als variabelen
- `assets/js/main.js` — pixelraster, priemgetallen-zeef, scroll-animaties, menu, filter, formulier
- `assets/img/`, `assets/video/` — beeld (deels tijdelijk, zie hieronder)

## Nog te doen voor livegang

- Eigen foto's: Physics Computing, HEMS en 4G-dongle gebruiken nu tijdelijk beeld.
- Contactformulier heeft nog geen backend: het opent nu het e-mailprogramma met een ingevuld bericht.
- Lettertypes (Archivo, IBM Plex) zelf hosten i.p.v. via Google Fonts (AVG).
