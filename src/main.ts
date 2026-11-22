import './styles/main.css';
import profile from './data/profile.json';
import figuresData from './data/figures.json';

interface FigureItem {
  id: string;
  plate: string;
  featured: boolean;
  title: string;
  summary: string;
  caption: string;
  category: string;
  sourceId: string;
  sourceTitle: string;
  venue: string;
  year: number;
  figureLabel: string;
  doi: string;
  citation: string;
  interactiveUrl?: string;
  interactiveLabel?: string;
  tools: string[];
  thumb: string;
  full: string;
  width: number;
  height: number;
  aspect: number;
}

const figures = figuresData as FigureItem[];

const state = {
  category: 'All',
  source: 'all',
  query: '',
  view: 'grid' as 'grid' | 'index',
  activeId: null as string | null,
  zoom: 1,
  panX: 0,
  panY: 0,
};

const CATEGORIES = [
  'All',
  'Featured',
  'Spatial & 3D Maps',
  'Clinical & Metagenomics',
  'Phylogenetics & Evolution',
  'Workflows & Systems',
];

const SOURCES = Array.from(
  new Map(
    figures.map((f) => [
      f.sourceId,
      { id: f.sourceId, label: `${f.venue} (${f.year})` },
    ])
  ).values()
);

function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getFilteredFigures(): FigureItem[] {
  const q = state.query.trim().toLowerCase();
  return figures.filter((f) => {
    if (state.category === 'Featured' && !f.featured) return false;
    if (
      state.category !== 'All' &&
      state.category !== 'Featured' &&
      f.category !== state.category
    ) {
      return false;
    }
    if (state.source !== 'all' && f.sourceId !== state.source) return false;
    if (q) {
      const hay = [
        f.title,
        f.summary,
        f.caption,
        f.venue,
        f.category,
        f.figureLabel,
        ...f.tools,
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function categoryCount(cat: string): number {
  if (cat === 'All') return figures.length;
  if (cat === 'Featured') return figures.filter((f) => f.featured).length;
  return figures.filter((f) => f.category === cat).length;
}

function getSpanClass(item: FigureItem, index: number, total: number): string {
  if (total <= 2) return 'span-half';
  if (item.aspect >= 1.5 && (index === 0 || item.id === 'respiratory-cohort-workflow')) {
    return 'span-wide';
  }
  return '';
}

function renderShell() {
  const heroFigure = figures[0];
  const featuredCount = figures.filter((f) => f.featured).length;
  const uniqueSources = new Set(figures.map((f) => f.sourceId)).size;
  const uniqueDisciplines = new Set(figures.map((f) => f.category)).size;

  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a href="#top" class="brand-link">
          <span class="brand-mark">IV</span>
          <span class="brand-text">
            <span class="brand-name">${escapeHtml(profile.name)}</span>
            <span class="brand-sub">${escapeHtml(profile.role)}</span>
          </span>
        </a>

        <nav class="nav-links" aria-label="Primary navigation">
          <a href="#gallery">Figures</a>
          <a href="#publications">Publications</a>
          <a href="#about">About &amp; Toolkit</a>
        </nav>

        <div class="header-actions">
          <a class="icon-btn" href="${profile.links.scholar}" target="_blank" rel="noopener noreferrer" aria-label="Google Scholar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 2 9l10 6 10-6-10-6Z"/><path d="M6 11.5V16c0 1.8 2.7 3.5 6 3.5s6-1.7 6-3.5v-4.5"/></svg>
            <span>Scholar</span>
          </a>
          <a class="icon-btn" href="${profile.links.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>
            <span>GitHub</span>
          </a>
          <button class="icon-btn" id="themeToggle" type="button" aria-label="Toggle color theme">
            <span id="themeIcon"></span>
          </button>
        </div>
      </div>
    </header>

    <main id="top">
      <section class="hero">
        <div class="container">
          <div class="hero-grid">
            <div>
              <div class="eyebrow">
                <span class="eyebrow-dot"></span>
                <span>Data Visualization Portfolio &middot; 2022 / 2026</span>
              </div>
              <h1 class="hero-title">${escapeHtml(profile.headline)}</h1>
              <p class="hero-bio">${escapeHtml(profile.bio)}</p>
              <div class="hero-actions">
                <a class="btn btn-primary" href="#gallery">
                  <span>Browse ${figures.length} Curated Figures</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                </a>
                <a class="btn" href="mailto:${escapeHtml(profile.links.email)}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                  <span>Contact</span>
                </a>
              </div>
            </div>

            <article class="hero-specimen" id="heroSpecimen" role="button" tabindex="0" aria-label="Inspect Plate 01: ${escapeHtml(heroFigure.title)}">
              <div class="hero-specimen-mat">
                <img src="./${heroFigure.thumb}" alt="${escapeHtml(heroFigure.title)}" />
              </div>
              <div class="hero-specimen-meta">
                <div class="hero-specimen-caption">
                  <strong>Plate ${heroFigure.plate}:</strong> ${escapeHtml(heroFigure.title)}
                </div>
                <span class="mono-tag">${escapeHtml(heroFigure.venue)} &middot; ${heroFigure.year}</span>
              </div>
            </article>
          </div>

          <div class="stats-strip">
            <div class="stat-item">
              <span class="stat-num">${figures.length}</span>
              <span class="stat-label">Curated Figures</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">${featuredCount}</span>
              <span class="stat-label">Featured Plates</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">${uniqueSources}</span>
              <span class="stat-label">Thesis &amp; Articles Featured</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">${uniqueDisciplines}</span>
              <span class="stat-label">Visualization Disciplines</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section" id="gallery">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="section-kicker">Curated Archive</div>
              <h2 class="section-title">Selected Scientific Plates</h2>
              <p class="section-desc">
                Click any plate to open the full-resolution zoom inspector with methods, citations, and direct PNG download.
              </p>
            </div>
            <span class="mono-tag" id="resultsCount"></span>
          </div>

          <div class="toolbar">
            <div class="filter-tabs" id="categoryTabs"></div>
            <div class="toolbar-controls">
              <div class="search-group">
                <div class="search-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                  <input
                    id="searchInput"
                    class="search-input"
                    type="search"
                    placeholder="Search viruses, tools, QGIS, Blender, IQ-TREE..."
                    aria-label="Search figures"
                  />
                </div>
                <select id="sourceSelect" class="source-select" aria-label="Filter by publication">
                  <option value="all">All Sources (${figures.length})</option>
                  ${SOURCES.map((s) => `<option value="${s.id}">${escapeHtml(s.label)}</option>`).join('')}
                </select>
              </div>
              <div class="view-toggle" role="group" aria-label="Layout view">
                <button class="view-btn active" data-view="grid" type="button">Gallery</button>
                <button class="view-btn" data-view="index" type="button">Index</button>
              </div>
            </div>
          </div>

          <div id="galleryMount"></div>
        </div>
      </section>

      <section class="section" id="publications">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="section-kicker">Research Context</div>
              <h2 class="section-title">Thesis &amp; Selected Publications</h2>
              <p class="section-desc">
                Doctoral research conducted at the University of São Paulo and Imperial College London, alongside collaborative viral genomics studies.
              </p>
            </div>
            <a class="btn" href="${profile.links.scholar}" target="_blank" rel="noopener noreferrer">
              <span>Full Google Scholar Profile</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 17 17 7M7 7h10v10"/></svg>
            </a>
          </div>

          <div class="pub-list">
            ${profile.publications
              .map((pub) => {
                const count = figures.filter((f) => f.sourceId === pub.id).length;
                return `
                  <div class="pub-row">
                    <div class="pub-year">${pub.year}</div>
                    <div>
                      <h3 class="pub-title">${escapeHtml(pub.title)}</h3>
                      <div class="pub-meta">
                        <span>${escapeHtml(pub.venue)}</span>
                        <span>&middot;</span>
                        <span>${escapeHtml(pub.role)}</span>
                        ${pub.doi ? `<span>&middot;</span><span class="mono-tag">DOI: ${escapeHtml(pub.doi)}</span>` : ''}
                      </div>
                    </div>
                    <div class="pub-actions">
                      ${
                        count > 0
                          ? `<button class="mini-link accent" type="button" data-filter-source="${pub.id}">${count} ${count === 1 ? 'Figure' : 'Figures'} &rarr;</button>`
                          : ''
                      }
                      ${
                        pub.doi
                          ? `<a class="mini-link" href="https://doi.org/${encodeURIComponent(pub.doi)}" target="_blank" rel="noopener noreferrer">Paper &#8599;</a>`
                          : ''
                      }
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </section>

      <section class="section" id="about">
        <div class="container">
          <div class="section-head">
            <div>
              <div class="section-kicker">Background &amp; Craft</div>
              <h2 class="section-title">About &amp; Visualization Toolkit</h2>
            </div>
          </div>

          <div class="about-grid">
            <div class="timeline">
              ${profile.affiliations
                .map(
                  (a) => `
                    <div class="timeline-item">
                      <div class="timeline-role">${escapeHtml(a.role)}</div>
                      <div class="timeline-inst">${escapeHtml(a.institution)} (${escapeHtml(a.location)})</div>
                      <div class="timeline-period">${escapeHtml(a.period)}</div>
                    </div>
                  `
                )
                .join('')}
            </div>

            <div class="toolkit-cards">
              ${profile.toolkit
                .map(
                  (t) => `
                    <div class="toolkit-card">
                      <div class="toolkit-group">${escapeHtml(t.group)}</div>
                      <div class="toolkit-tags">
                        ${t.items.map((item) => `<span class="tool-chip">${escapeHtml(item)}</span>`).join('')}
                      </div>
                    </div>
                  `
                )
                .join('')}
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <div>&copy; ${new Date().getFullYear()} ${escapeHtml(profile.name)} &middot; ${escapeHtml(profile.location)}</div>
        <div class="footer-links">
          <a href="mailto:${escapeHtml(profile.links.email)}">${escapeHtml(profile.links.email)}</a>
          <a href="${profile.links.github}" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="${profile.links.scholar}" target="_blank" rel="noopener noreferrer">Google Scholar</a>
          <a href="#top">Back to top &uarr;</a>
        </div>
      </div>
    </footer>

    <!-- Full-Resolution Scientific Plate Inspector -->
    <div class="inspector-overlay" id="inspectorOverlay" role="dialog" aria-modal="true" aria-labelledby="inspectorTitle">
      <div class="inspector-shell">
        <div class="inspector-stage" id="inspectorStage">
          <button class="stage-nav-btn prev" id="btnPrevPlate" type="button" aria-label="Previous plate">&#8592;</button>
          <img id="inspectorImg" src="" alt="" />
          <button class="stage-nav-btn next" id="btnNextPlate" type="button" aria-label="Next plate">&#8594;</button>
          <div class="stage-controls">
            <button type="button" id="btnZoomOut" title="Zoom out (-)">&minus;</button>
            <span class="zoom-readout" id="zoomReadout">100%</span>
            <button type="button" id="btnZoomIn" title="Zoom in (+)">+</button>
            <button type="button" id="btnZoomReset" title="Reset view (0)">Reset</button>
          </div>
        </div>

        <aside class="inspector-sidebar">
          <div class="inspector-sidebar-head">
            <span class="mono-tag" id="inspectorPlateMeta">PLATE 01</span>
            <button class="inspector-close" id="btnCloseInspector" type="button" aria-label="Close inspector">&#10005;</button>
          </div>

          <div class="inspector-content" id="inspectorContent"></div>

          <div class="inspector-actions" id="inspectorActions"></div>
        </aside>
      </div>
    </div>
  `;
}

function updateThemeIcon() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  const el = document.getElementById('themeIcon');
  if (!el) return;
  el.innerHTML = isDark
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}

function renderTabs() {
  const el = document.getElementById('categoryTabs');
  if (!el) return;
  el.innerHTML = CATEGORIES.map(
    (cat) => `
      <button class="tab-btn ${state.category === cat ? 'active' : ''}" data-cat="${escapeHtml(cat)}" type="button">
        <span>${escapeHtml(cat)}</span>
        <span class="tab-count">${categoryCount(cat)}</span>
      </button>
    `
  ).join('');

  el.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
    btn.onclick = () => {
      state.category = btn.dataset.cat || 'All';
      renderTabs();
      renderGallery();
    };
  });
}

function renderGallery() {
  const mount = document.getElementById('galleryMount');
  const countEl = document.getElementById('resultsCount');
  if (!mount || !countEl) return;

  const list = getFilteredFigures();
  countEl.textContent = `Showing ${list.length} of ${figures.length} plates`;

  if (!list.length) {
    mount.innerHTML = `
      <div class="empty-state">
        <p style="margin:0 0 12px;font-size:15px;color:var(--ink);">No figures match your current filter.</p>
        <button class="btn" id="btnResetFilters" type="button">Reset filters</button>
      </div>
    `;
    document.getElementById('btnResetFilters')?.addEventListener('click', () => {
      state.category = 'All';
      state.source = 'all';
      state.query = '';
      (document.getElementById('searchInput') as HTMLInputElement).value = '';
      (document.getElementById('sourceSelect') as HTMLSelectElement).value = 'all';
      renderTabs();
      renderGallery();
    });
    return;
  }

  if (state.view === 'index') {
    mount.innerHTML = `
      <div class="index-list">
        ${list
          .map(
            (f) => `
              <div class="index-row" data-open="${f.id}" role="button" tabindex="0">
                <span class="mono-tag">PLATE ${f.plate}</span>
                <div class="index-thumb"><img src="./${f.thumb}" alt="${escapeHtml(f.title)}" loading="lazy" /></div>
                <div>
                  <div style="font-family:var(--font-serif);font-size:17px;font-weight:500;line-height:1.25;">${escapeHtml(f.title)}</div>
                  <div style="font-size:12.5px;color:var(--ink-muted);margin-top:2px;">${escapeHtml(f.category)} &middot; ${escapeHtml(f.figureLabel)}</div>
                </div>
                <div class="hide-sm">
                  <span class="venue-pill">${escapeHtml(f.venue)} (${f.year})</span>
                </div>
                <div class="hide-sm" style="text-align:right;">
                  ${f.featured ? '<span class="featured-badge">Featured</span>' : '<span class="mono-tag">Inspect</span>'}
                </div>
              </div>
            `
          )
          .join('')}
      </div>
    `;
  } else {
    mount.innerHTML = `
      <div class="gallery-grid">
        ${list
          .map((f, idx) => {
            const spanClass = getSpanClass(f, idx, list.length);
            return `
              <article class="plate-card ${spanClass}" data-open="${f.id}" role="button" tabindex="0">
                <div class="plate-frame">
                  <img src="./${f.thumb}" alt="${escapeHtml(f.title)}" loading="lazy" />
                  <span class="plate-inspect-pill">Inspect full-res &#8599;</span>
                </div>
                <div class="plate-body">
                  <div class="plate-meta-row">
                    <span class="plate-num">
                      <span>PLATE ${f.plate}</span>
                      ${f.featured ? '<span class="featured-badge">Featured</span>' : ''}
                    </span>
                    <span class="venue-pill">${escapeHtml(f.venue)} &middot; ${f.year}</span>
                  </div>
                  <h3 class="plate-title">${escapeHtml(f.title)}</h3>
                  <p class="plate-summary">${escapeHtml(f.summary)}</p>
                  <div class="plate-tools">
                    ${f.tools.map((t) => `<span class="tool-chip">${escapeHtml(t)}</span>`).join('')}
                  </div>
                </div>
              </article>
            `;
          })
          .join('')}
      </div>
    `;
  }

  mount.querySelectorAll<HTMLElement>('[data-open]').forEach((el) => {
    const open = () => openInspector(el.dataset.open!);
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
}

function applyTransform() {
  const img = document.getElementById('inspectorImg') as HTMLImageElement | null;
  const readout = document.getElementById('zoomReadout');
  if (!img || !readout) return;
  img.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
  readout.textContent = `${Math.round(state.zoom * 100)}%`;
}

function resetZoom() {
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  applyTransform();
}

function setZoom(next: number) {
  state.zoom = Math.min(3.5, Math.max(0.75, next));
  if (state.zoom <= 1) {
    state.panX = 0;
    state.panY = 0;
  }
  applyTransform();
}

function openInspector(id: string) {
  const item = figures.find((f) => f.id === id);
  if (!item) return;
  state.activeId = id;
  resetZoom();

  const overlay = document.getElementById('inspectorOverlay')!;
  const img = document.getElementById('inspectorImg') as HTMLImageElement;
  const meta = document.getElementById('inspectorPlateMeta')!;
  const content = document.getElementById('inspectorContent')!;
  const actions = document.getElementById('inspectorActions')!;

  img.src = `./${item.full}`;
  img.alt = item.title;
  meta.textContent = `PLATE ${item.plate} · ${item.figureLabel.toUpperCase()}`;

  content.innerHTML = `
    <div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
        <span class="venue-pill">${escapeHtml(item.venue)} (${item.year})</span>
        ${item.featured ? '<span class="featured-badge">Featured Plate</span>' : ''}
      </div>
      <h2 class="inspector-title" id="inspectorTitle">${escapeHtml(item.title)}</h2>
      <div style="font-size:13px;color:var(--ink-muted);margin-top:6px;">${escapeHtml(item.sourceTitle)}</div>
    </div>

    <div>
      <div class="inspector-label">Overview</div>
      <p class="inspector-summary">${escapeHtml(item.summary)}</p>
    </div>

    <div>
      <div class="inspector-label">Scientific Legend</div>
      <p class="inspector-caption">${escapeHtml(item.caption)}</p>
    </div>

    <div>
      <div class="inspector-label">Tools &amp; Methods</div>
      <div class="toolkit-tags">
        <span class="tool-chip">${escapeHtml(item.category)}</span>
        ${item.tools.map((t) => `<span class="tool-chip">${escapeHtml(t)}</span>`).join('')}
      </div>
    </div>

    <div>
      <div class="inspector-label">Citation &amp; Resolution</div>
      <div class="citation-box">
        ${escapeHtml(item.citation)}
        <div class="mono-tag" style="margin-top:8px;">${item.width} x ${item.height} px PNG</div>
      </div>
    </div>
  `;

  actions.innerHTML = `
    <a class="btn btn-primary" href="./${item.full}" download="${item.id}.png" style="padding:8px 14px;font-size:12.5px;">
      Download PNG
    </a>
    <button class="btn" id="btnCopyCite" type="button" style="padding:8px 14px;font-size:12.5px;">
      Copy Citation
    </button>
    ${
      item.doi
        ? `<a class="btn" href="https://doi.org/${encodeURIComponent(item.doi)}" target="_blank" rel="noopener noreferrer" style="padding:8px 14px;font-size:12.5px;">DOI &#8599;</a>`
        : ''
    }
    ${
      item.interactiveUrl
        ? `<a class="btn" href="${item.interactiveUrl}" target="_blank" rel="noopener noreferrer" style="padding:8px 14px;font-size:12.5px;">${escapeHtml(item.interactiveLabel || 'Interactive View')} &#8599;</a>`
        : ''
    }
  `;

  document.getElementById('btnCopyCite')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    await navigator.clipboard.writeText(item.citation);
    btn.textContent = 'Copied!';
    setTimeout(() => (btn.textContent = 'Copy Citation'), 1400);
  });

  overlay.classList.add('open');
  document.body.classList.add('modal-open');
  history.replaceState(null, '', `#plate-${item.plate}`);
}

function closeInspector() {
  state.activeId = null;
  document.getElementById('inspectorOverlay')?.classList.remove('open');
  document.body.classList.remove('modal-open');
  if (location.hash.startsWith('#plate-')) {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

function stepInspector(delta: number) {
  if (!state.activeId) return;
  const list = getFilteredFigures();
  const pool = list.some((f) => f.id === state.activeId) ? list : figures;
  const idx = pool.findIndex((f) => f.id === state.activeId);
  if (idx < 0) return;
  const next = (idx + delta + pool.length) % pool.length;
  openInspector(pool[next].id);
}

function wireEvents() {
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('iv-theme', next);
    updateThemeIcon();
  });

  const heroSpec = document.getElementById('heroSpecimen');
  heroSpec?.addEventListener('click', () => openInspector(figures[0].id));
  heroSpec?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openInspector(figures[0].id);
    }
  });

  document.getElementById('searchInput')?.addEventListener('input', (e) => {
    state.query = (e.target as HTMLInputElement).value;
    renderGallery();
  });

  document.getElementById('sourceSelect')?.addEventListener('change', (e) => {
    state.source = (e.target as HTMLSelectElement).value;
    renderGallery();
  });

  document.querySelectorAll<HTMLButtonElement>('.view-btn').forEach((btn) => {
    btn.onclick = () => {
      state.view = (btn.dataset.view as 'grid' | 'index') || 'grid';
      document.querySelectorAll('.view-btn').forEach((b) => b.classList.toggle('active', b === btn));
      renderGallery();
    };
  });

  document.querySelectorAll<HTMLButtonElement>('[data-filter-source]').forEach((btn) => {
    btn.onclick = () => {
      const sid = btn.dataset.filterSource || 'all';
      state.category = 'All';
      state.source = sid;
      (document.getElementById('sourceSelect') as HTMLSelectElement).value = sid;
      renderTabs();
      renderGallery();
      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
    };
  });

  // Inspector controls
  document.getElementById('btnCloseInspector')?.addEventListener('click', closeInspector);
  document.getElementById('inspectorOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeInspector();
  });
  document.getElementById('btnPrevPlate')?.addEventListener('click', () => stepInspector(-1));
  document.getElementById('btnNextPlate')?.addEventListener('click', () => stepInspector(1));
  document.getElementById('btnZoomIn')?.addEventListener('click', () => setZoom(state.zoom + 0.35));
  document.getElementById('btnZoomOut')?.addEventListener('click', () => setZoom(state.zoom - 0.35));
  document.getElementById('btnZoomReset')?.addEventListener('click', resetZoom);

  // Wheel zoom & drag pan inside stage
  const stage = document.getElementById('inspectorStage')!;
  let dragging = false;
  let startX = 0;
  let startY = 0;

  stage.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      setZoom(state.zoom + delta);
    },
    { passive: false }
  );

  stage.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (state.zoom <= 1) return;
    dragging = true;
    startX = e.clientX - state.panX;
    startY = e.clientY - state.panY;
    stage.classList.add('dragging');
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    state.panX = e.clientX - startX;
    state.panY = e.clientY - startY;
    applyTransform();
  });

  const endDrag = () => {
    dragging = false;
    stage.classList.remove('dragging');
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  stage.addEventListener('dblclick', (e) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (state.zoom > 1.1) resetZoom();
    else setZoom(2.0);
  });

  document.addEventListener('keydown', (e) => {
    if (!state.activeId) return;
    if (e.key === 'Escape') closeInspector();
    else if (e.key === 'ArrowRight') stepInspector(1);
    else if (e.key === 'ArrowLeft') stepInspector(-1);
    else if (e.key === '+' || e.key === '=') setZoom(state.zoom + 0.3);
    else if (e.key === '-') setZoom(state.zoom - 0.3);
    else if (e.key === '0') resetZoom();
  });
}

function checkInitialHash() {
  const m = location.hash.match(/^#plate-(\d{2})$/);
  if (!m) return;
  const found = figures.find((f) => f.plate === m[1]);
  if (found) openInspector(found.id);
}

renderShell();
updateThemeIcon();
renderTabs();
renderGallery();
wireEvents();
checkInitialHash();
