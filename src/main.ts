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
  filter: 'All',
  sourceFilter: 'all',
  activeId: null as string | null,
  zoom: 1,
  panX: 0,
  panY: 0,
};

const FILTERS = [
  { key: 'All', label: 'All' },
  { key: 'Featured', label: 'Featured' },
  { key: 'Spatial & 3D Maps', label: 'Spatial & 3D' },
  { key: 'Clinical & Metagenomics', label: 'Clinical & Metagenomics' },
  { key: 'Phylogenetics & Evolution', label: 'Phylogenetics' },
  { key: 'Workflows & Systems', label: 'Workflows' },
];

function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getFilteredFigures(): FigureItem[] {
  return figures.filter((f) => {
    if (state.sourceFilter !== 'all' && f.sourceId !== state.sourceFilter) return false;
    if (state.filter === 'Featured') return f.featured;
    if (state.filter !== 'All' && f.category !== state.filter) return false;
    return true;
  });
}

function renderShell() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a href="#top" class="brand-name">${escapeHtml(profile.name)}</a>

        <nav class="nav-links" aria-label="Primary navigation">
          <a href="#figures">Figures</a>
          <a href="#publications">Publications</a>
          <a href="#about">About</a>
        </nav>
      </div>
    </header>

    <main id="top">
      <section class="intro">
        <div class="container">
          <h1 class="intro-title">${escapeHtml(profile.headline)}</h1>
          <p class="intro-bio">${escapeHtml(profile.bio)}</p>
          <div class="intro-links">
            <a href="${profile.links.scholar}" target="_blank" rel="noopener noreferrer">Google Scholar</a>
            <a href="${profile.links.github}" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="mailto:${escapeHtml(profile.links.email)}">${escapeHtml(profile.links.email)}</a>
          </div>
        </div>
      </section>

      <section class="gallery-section" id="figures">
        <div class="container">
          <div class="filter-bar">
            <div class="filter-tabs" id="filterTabs"></div>
            <span class="filter-count" id="filterCount"></span>
          </div>
          <div class="gallery-grid" id="galleryGrid"></div>
        </div>
      </section>

      <section class="section reveal" id="publications">
        <div class="container">
          <h2 class="section-title">Selected Publications</h2>
          <div class="pub-list">
            ${profile.publications
              .map((pub) => {
                const count = figures.filter((f) => f.sourceId === pub.id).length;
                return `
                  <div class="pub-row">
                    <div class="pub-year">${pub.year}</div>
                    <div>
                      <h3 class="pub-title">${escapeHtml(pub.title)}</h3>
                      <div class="pub-venue">${escapeHtml(pub.venue)}</div>
                    </div>
                    <div class="pub-links">
                      ${
                        count > 0
                          ? `<button type="button" data-source="${pub.id}">${count} ${count === 1 ? 'figure' : 'figures'}</button>`
                          : ''
                      }
                      ${
                        pub.doi
                          ? `<a href="https://doi.org/${encodeURIComponent(pub.doi)}" target="_blank" rel="noopener noreferrer">DOI &#8599;</a>`
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

      <section class="section reveal" id="about">
        <div class="container">
          <h2 class="section-title">About &amp; Tools</h2>
          <div class="about-grid">
            <div class="about-list">
              ${profile.affiliations
                .map(
                  (a) => `
                    <div>
                      <div class="about-item-title">${escapeHtml(a.role)}</div>
                      <div class="about-item-sub">${escapeHtml(a.institution)}</div>
                      <div class="about-item-period">${escapeHtml(a.period)}</div>
                    </div>
                  `
                )
                .join('')}
            </div>

            <div class="about-list">
              ${profile.toolkit
                .map(
                  (t) => `
                    <div>
                      <div class="toolkit-label">${escapeHtml(t.group)}</div>
                      <p class="toolkit-text">${escapeHtml(t.items)}</p>
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
          <a href="${profile.links.scholar}" target="_blank" rel="noopener noreferrer">Google Scholar</a>
          <a href="${profile.links.github}" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="mailto:${escapeHtml(profile.links.email)}">Email</a>
        </div>
      </div>
    </footer>

    <!-- Full-Resolution Plate Inspector -->
    <div class="inspector-overlay" id="inspectorOverlay" role="dialog" aria-modal="true" aria-labelledby="inspectorTitle">
      <div class="inspector-shell">
        <div class="inspector-stage" id="inspectorStage">
          <button class="stage-nav-btn prev" id="btnPrevPlate" type="button" aria-label="Previous figure">&#8592;</button>
          <img id="inspectorImg" src="" alt="" />
          <button class="stage-nav-btn next" id="btnNextPlate" type="button" aria-label="Next figure">&#8594;</button>
          <div class="stage-controls">
            <button type="button" id="btnZoomOut" title="Zoom out (-)">&minus;</button>
            <span class="zoom-readout" id="zoomReadout">100%</span>
            <button type="button" id="btnZoomIn" title="Zoom in (+)">+</button>
            <button type="button" id="btnZoomReset" title="Reset view (0)">Reset</button>
          </div>
        </div>

        <aside class="inspector-sidebar">
          <div class="inspector-head">
            <span class="plate-num" id="inspectorMeta">01</span>
            <button class="inspector-close" id="btnCloseInspector" type="button" aria-label="Close">&#10005;</button>
          </div>
          <div class="inspector-content" id="inspectorContent"></div>
          <div class="inspector-actions" id="inspectorActions"></div>
        </aside>
      </div>
    </div>
  `;
}

function renderTabs() {
  const el = document.getElementById('filterTabs')!;
  el.innerHTML = FILTERS.map(
    (f) => `
      <button class="tab-btn ${state.filter === f.key && state.sourceFilter === 'all' ? 'active' : ''}" data-filter="${escapeHtml(f.key)}" type="button">
        ${escapeHtml(f.label)}
      </button>
    `
  ).join('');

  el.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
    btn.onclick = () => {
      state.filter = btn.dataset.filter || 'All';
      state.sourceFilter = 'all';
      renderTabs();
      renderGallery();
    };
  });
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid')!;
  const countEl = document.getElementById('filterCount')!;
  const list = getFilteredFigures();

  if (state.sourceFilter !== 'all') {
    const srcLabel = list[0]?.venue || state.sourceFilter;
    countEl.innerHTML = `${escapeHtml(srcLabel)} (${list.length}) &middot; <button type="button" id="clearSourceBtn" style="border:none;background:none;padding:0;text-decoration:underline;cursor:pointer;font:inherit;color:var(--ink);">Show all</button>`;
    document.getElementById('clearSourceBtn')?.addEventListener('click', () => {
      state.sourceFilter = 'all';
      state.filter = 'All';
      renderTabs();
      renderGallery();
    });
  } else {
    countEl.textContent = `${list.length} ${list.length === 1 ? 'figure' : 'figures'}`;
  }

  grid.innerHTML = list
    .map((f, idx) => {
      const spanFull = (idx === 0 && f.aspect >= 1.45 && list.length > 2) || f.aspect >= 2.1;
      const venueText = f.sourceId === 'thesis' ? 'PhD Thesis (in progress)' : `${f.venue}, ${f.year}`;
      const staggerMs = idx === 0 ? 60 : (idx % 2) * 140;
      return `
        <article class="plate-card reveal ${spanFull ? 'span-full' : ''}" data-open="${f.id}" style="transition-delay:${staggerMs}ms" role="button" tabindex="0">
          <div class="plate-frame">
            <img src="./${f.thumb}" alt="${escapeHtml(f.title)}" loading="${idx < 3 ? 'eager' : 'lazy'}" />
          </div>
          <div class="plate-caption-block">
            <h2 class="plate-title">${escapeHtml(f.title)}</h2>
            <div class="plate-meta">
              <span class="plate-num">${f.plate}</span>
              <span>&middot;</span>
              <span>${escapeHtml(venueText)}</span>
              <span>&middot;</span>
              <span>${escapeHtml(f.figureLabel)}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  grid.querySelectorAll<HTMLElement>('[data-open]').forEach((el) => {
    const open = () => openInspector(el.dataset.open!);
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  observeReveals();
}

let revealObserver: IntersectionObserver | null = null;

function observeReveals() {
  if (revealObserver) revealObserver.disconnect();

  const targets = document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)');
  if (!targets.length) return;

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !('IntersectionObserver' in window)
  ) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            entry.target.classList.add('is-visible');
          });
          obs.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.02, rootMargin: '0px 0px 40px 0px' }
  );

  targets.forEach((el) => revealObserver!.observe(el));
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
  const meta = document.getElementById('inspectorMeta')!;
  const content = document.getElementById('inspectorContent')!;
  const actions = document.getElementById('inspectorActions')!;

  const venueText = item.sourceId === 'thesis' ? 'PhD Thesis (in progress)' : `${item.venue} (${item.year})`;

  img.src = `./${item.full}`;
  img.alt = item.title;
  meta.textContent = `PLATE ${item.plate} · ${item.figureLabel.toUpperCase()}`;

  content.innerHTML = `
    <div>
      <h2 class="inspector-title" id="inspectorTitle">${escapeHtml(item.title)}</h2>
      <div class="inspector-source">${escapeHtml(venueText)}</div>
    </div>

    <div>
      <div class="inspector-label">Overview</div>
      <p class="inspector-text">${escapeHtml(item.summary)}</p>
    </div>

    <div>
      <div class="inspector-label">Figure Legend</div>
      <p class="inspector-box">${escapeHtml(item.caption)}</p>
    </div>

    <div>
      <div class="inspector-label">Tools &amp; Methods</div>
      <p class="inspector-text">${escapeHtml(item.tools.join(', '))}</p>
    </div>

    <div>
      <div class="inspector-label">Citation</div>
      <div class="inspector-box">
        ${escapeHtml(item.citation)}
        <div class="plate-num" style="margin-top:8px;color:var(--ink-muted);">${item.width} x ${item.height} px</div>
      </div>
    </div>
  `;

  actions.innerHTML = `
    <a class="action-btn primary" href="./${item.full}" download="${item.id}.png">Download PNG</a>
    <button class="action-btn" id="btnCopyCite" type="button">Copy citation</button>
    ${
      item.doi
        ? `<a class="action-btn" href="https://doi.org/${encodeURIComponent(item.doi)}" target="_blank" rel="noopener noreferrer">DOI &#8599;</a>`
        : ''
    }
    ${
      item.interactiveUrl
        ? `<a class="action-btn" href="${item.interactiveUrl}" target="_blank" rel="noopener noreferrer">Microreact &#8599;</a>`
        : ''
    }
  `;

  document.getElementById('btnCopyCite')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    await navigator.clipboard.writeText(item.citation);
    btn.textContent = 'Copied';
    setTimeout(() => (btn.textContent = 'Copy citation'), 1400);
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
  document.querySelectorAll<HTMLButtonElement>('[data-source]').forEach((btn) => {
    btn.onclick = () => {
      state.sourceFilter = btn.dataset.source || 'all';
      state.filter = 'All';
      renderTabs();
      renderGallery();
      document.getElementById('figures')?.scrollIntoView({ behavior: 'smooth' });
    };
  });

  document.getElementById('btnCloseInspector')?.addEventListener('click', closeInspector);
  document.getElementById('inspectorOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeInspector();
  });
  document.getElementById('btnPrevPlate')?.addEventListener('click', () => stepInspector(-1));
  document.getElementById('btnNextPlate')?.addEventListener('click', () => stepInspector(1));
  document.getElementById('btnZoomIn')?.addEventListener('click', () => setZoom(state.zoom + 0.35));
  document.getElementById('btnZoomOut')?.addEventListener('click', () => setZoom(state.zoom - 0.35));
  document.getElementById('btnZoomReset')?.addEventListener('click', resetZoom);

  const stage = document.getElementById('inspectorStage')!;
  let dragging = false;
  let startX = 0;
  let startY = 0;

  stage.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      setZoom(state.zoom + (e.deltaY < 0 ? 0.2 : -0.2));
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
renderTabs();
renderGallery();
wireEvents();
checkInitialHash();
