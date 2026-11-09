# Werkafspraken voor deze repo

Statische site, Nederlandstalig. Zie README.md voor de structuur.

- Bewerk nooit de gegenereerde HTML in de root of in `projecten/`; pas `src/` aan en draai `python3 build.py`. Commit de gegenereerde HTML mee.
- Projecten staan in `src/projects.json`; nieuwe afbeeldingen in `assets/img/` als `.webp`.
- Geen externe scripts, fonts of trackers toevoegen; alles wordt lokaal gehost (AVG, geen cookiebanner).
- Controleer wijzigingen ook op telefoonbreedte (360–390px): geen horizontale scroll, menu werkt na scrollen.
- Om op te leveren: `python3 build.py zip` → `primeconnect-site.zip`.
