# Spelletjes

Een verzameling browser-gebaseerde spelletjes gebouwd met vanilla HTML, CSS en JavaScript.

**Live:** https://jwkuper.github.io/claude_bke/

## Spelletjes

| Spel | Beschrijving |
|------|-------------|
| Boter Kaas & Eieren | Klassiek 3×3 spel voor 2 spelers |
| Vier op een Rij | Verbind als eerste 4 schijven op een rij in een 7×6 raster |

## Projectstructuur

```
/
├── index.html                  # Startpagina (game launcher)
├── shared/
│   └── style.css               # Gedeelde CSS variabelen en stijlen
├── games/
│   ├── bke/                    # Boter Kaas en Eieren
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   └── vier-op-een-rij/        # Vier op een Rij
│       ├── index.html
│       ├── style.css
│       └── script.js
└── settings/
    └── index.html              # Instellingen (spelersnamen)
```

## Nieuw spel toevoegen

1. Maak een map aan onder `games/mijn-spel/`
2. Voeg `index.html`, `style.css` en `script.js` toe
3. Link `../../shared/style.css` in de HTML voor de gedeelde stijlen
4. Voeg een kaartje toe in de root `index.html`

## Hosting

De site wordt automatisch gepubliceerd via GitHub Pages bij elke push naar `main`.
