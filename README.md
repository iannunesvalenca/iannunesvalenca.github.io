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

## Publishing to `iannunesvalenca-creator.github.io`

1. Create a public GitHub repository named `iannunesvalenca-creator.github.io`.
2. Push this folder to the `main` branch:

```bash
git init
git add .
git commit -m "Initial scientific visualization portfolio"
git branch -M main
git remote add origin https://github.com/iannunesvalenca-creator/iannunesvalenca-creator.github.io.git
git push -u origin main
```

3. On GitHub, open **Settings > Pages**, set **Source** to **GitHub Actions**, and wait about one minute for the deploy workflow to finish. Your site will be live at `https://iannunesvalenca-creator.github.io`.
