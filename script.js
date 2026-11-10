'use strict';

const papers = [...document.querySelectorAll('.paper')];
const filters = [...document.querySelectorAll('[data-filter]')];
const toolbar = document.querySelector('.paper-toolbar');
const controls = document.querySelector('.paper-controls');
const expandButton = document.querySelector('#show-papers');
const status = document.querySelector('#paper-status');
const pageSize = 6;
let selectedFilter = 'all';
let expanded = false;

function updatePapers() {
  const matching = papers.filter(paper => selectedFilter === 'all' || paper.dataset.kind === selectedFilter || (selectedFilter === 'published' && paper.dataset.kind === 'accepted'));
  const visible = expanded ? matching : matching.slice(0, pageSize);
  const visibleSet = new Set(visible);
  for (const paper of papers) paper.hidden = !visibleSet.has(paper);
  for (const filter of filters) {
    const active = filter.dataset.filter === selectedFilter;
    filter.classList.toggle('is-active', active);
    filter.setAttribute('aria-pressed', String(active));
  }
  expandButton.hidden = matching.length <= pageSize;
  expandButton.setAttribute('aria-expanded', String(expanded));
  expandButton.replaceChildren(document.createTextNode(expanded ? 'Show fewer papers ' : `Show all ${matching.length} papers `));
  const symbol = document.createElement('span');
  symbol.setAttribute('aria-hidden', 'true');
  symbol.textContent = expanded ? '−' : '+';
  expandButton.append(symbol);
  status.textContent = `${visible.length} of ${matching.length} papers`;
}

for (const filter of filters) {
  filter.addEventListener('click', () => {
    selectedFilter = filter.dataset.filter;
    expanded = false;
    updatePapers();
  });
}

expandButton.addEventListener('click', () => {
  const wasExpanded = expanded;
  expanded = !expanded;
  updatePapers();
  if (wasExpanded) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    toolbar.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
  }
});

toolbar.hidden = false;
controls.hidden = false;
updatePapers();

let previousTalkState = false;
window.addEventListener('beforeprint', () => {
  const earlierTalks = document.querySelector('.earlier-talks');
  if (!earlierTalks) return;
  previousTalkState = earlierTalks.open;
  earlierTalks.open = true;
});
window.addEventListener('afterprint', () => {
  const earlierTalks = document.querySelector('.earlier-talks');
  if (earlierTalks) earlierTalks.open = previousTalkState;
});
