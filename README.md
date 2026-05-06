# Carbon4Future — Landing Page

## Struktur

```
c4f-landing/
├── index.html          # HTML-Struktur (18 KB statt 5 MB)
├── css/
│   └── style.css       # Alle Styles (Liquid Glass, Animationen, etc.)
├── js/
│   └── main.js         # Scroll-Animationen, Interaktionen
├── assets/
│   └── images/
│       ├── hero-bg-0.jpg   # Hero Hintergrundbild
│       ├── hero-bg-1.png   # Weitere Bilder
│       ├── hero-bg-2.png
│       ├── hero-bg-3.png
│       ├── img-10.png
│       └── img-11.png
├── .gitignore
└── README.md
```

## Entwicklung

Einfach `index.html` im Browser öffnen — kein Build-Step nötig.

## Git

```bash
git init
git add .
git commit -m "Initial commit — Landing Page Carbon4Future"
```

## Deployment (Vercel)

```bash
vercel deploy
```
