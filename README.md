# Ian Nunes Valença: Scientific Data Visualization Portfolio

Static portfolio site showcasing selected scientific figures, spatial maps, phylogenetic analyses, and bioinformatics schematics from my PhD thesis and published articles. Built with Vite and TypeScript for automatic deployment on GitHub Pages.

## Local Development

```bash
npm install
npm run dev
```

Build the static production bundle:

```bash
npm run build
npm run preview
```

## Adding New Figures Later

1. Place the full-resolution PNG in `public/figures/full/` and a compressed WebP thumbnail in `public/figures/thumb/`.
2. Add a new entry to `src/data/figures.json`.
3. Push to `main`. GitHub Actions builds and publishes the updated site automatically.

## Publishing to `iannunesvalenca.github.io`

This repository deploys automatically to `https://iannunesvalenca.github.io` via GitHub Actions ([deploy.yml](.github/workflows/deploy.yml)) on every push to `main`.
