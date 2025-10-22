// === Config ===
const SUBMIT_URL = 'https://github.com/dstaggs-15/cfb26/issues/new/choose';
const DATA_DIR = './data';

// === Elements ===
const submitLink = document.querySelector('#submitLink');
const tabGames = document.querySelector('#tabGames');
const tabHeisman = document.querySelector('#tabHeisman');
const tabNattys = document.querySelector('#tabNattys');

const panelGames = document.querySelector('#panelGames');
const panelHeisman = document.querySelector('#panelHeisman');
const panelNattys = document.querySelector('#panelNattys');

const coachFilter = document.querySelector('#coachFilter');
const yearFilter = document.querySelector('#yearFilter');
const legend = document.querySelector('#legend');

const gamesBody = document.querySelector('#gamesBody');
const heismanBody = document.querySelector('#heismanBody');
const nattyBody = document.querySelector('#nattyBody');

// === State ===
let COLORS = {};
let COACHES = ["Cameron","Tucker","Daniel","Eli"];
let GAMES = [];
let HEISMAN = [];
let NATIONALS = [];

// === Helpers ===
const safeFetchJson = async (path, fallback) => {
  try {
    const r = await fetch(path, { cache: 'no-store' });
    if (!r.ok) return fallback;
    const t = await r.text();
    if (!t.trim()) return fallback;
    return JSON.parse(t);
  } catch { return fallback; }
};

const chip = (name) => {
  const c = COLORS[name];
  const bg = c?.primary || '#374151';
  const fg = c?.secondary || '#cbd5e1';
  return `<span class="px-2 py-0.5 rounded-lg text-xs" style="background:${bg}; color:${fg}">${name}</span>`;
};

const showPanel = (games=false, heis=false, natty=false) => {
  panelGames.classList.toggle('hidden', !games);
  panelHeisman.classList.toggle('hidden', !heis);
  panelNattys.classList.toggle('hidden', !natty);
};

// === Renderers ===
const renderLegend = () => {
  const teams = new Set();
  GAMES.forEach(g => { if (g.homeTeam) teams.add(g.homeTeam); if (g.awayTeam) teams.add(g.awayTeam); });
  legend.innerHTML = [...teams].slice(0, 40).map(t => chip(t)).join(' ');
};

const renderFilters = () => {
  const uniq = new Set(COACHES);
  GAMES.forEach(g => { if (g.homeCoach) uniq.add(g.homeCoach); if (g.awayCoach) uniq.add(g.awayCoach); });
  coachFilter.innerHTML = `<option value="">All coaches</option>` + [...uniq].sort().map(c => `<option>${c}</option>`).join('');
};

const applyFilters = (rows) => {
  const coach = coachFilter.value.trim();
  const year = Number(yearFilter.value) || null;
  return rows.filter(r => (!coach || r.coaches?.includes(coach)) && (!year || r.year === year));
};

const renderGames = () => {
  const rows = applyFilters([...GAMES]).sort((a,b)=> (b.year||0)-(a.year||0));
  gamesBody.innerHTML = rows.map(r => `
    <tr class="border-t border-white/5">
      <td class="p-3">${r.year ?? ''}</td>
      <td class="p-3">${r.homeCoach ?? ''}</td>
      <td class="p-3">${r.awayCoach ?? ''}</td>
      <td class="p-3 flex gap-2">${chip(r.homeTeam||'')}${chip(r.awayTeam||'')}</td>
      <td class="p-3">${r.homeScore ?? ''} - ${r.awayScore ?? ''}</td>
      <td class="p-3">${r.winner ?? ''}</td>
    </tr>
  `).join('');
};

const renderHeisman = () => {
  heismanBody.innerHTML = [...HEISMAN].sort((a,b)=> (b.year||0)-(a.year||0)).map(h => `
    <tr class="border-t border-white/5">
      <td class="p-3">${h.year ?? ''}</td>
      <td class="p-3">${h.player ?? ''}</td>
      <td class="p-3">${chip(h.school||'')}</td>
    </tr>
  `).join('');
};

const renderNattys = () => {
  nattyBody.innerHTML = [...NATIONALS].sort((a,b)=> (b.year||0)-(a.year||0)).map(n => `
    <tr class="border-t border-white/5">
      <td class="p-3">${n.year ?? ''}</td>
      <td class="p-3">${chip(n.team||'')}</td>
      <td class="p-3">${n.coach ?? ''}</td>
      <td class="p-3">${n.record ?? ''}</td>
    </tr>
  `).join('');
};

// === Init ===
const init = async () => {
  submitLink.href = SUBMIT_URL;

  // Load all data safely with fallbacks
  const [colors, coaches, games, heisman, nationals] = await Promise.all([
    safeFetchJson(`${DATA_DIR}/colors.json`, {}),
    safeFetchJson(`${DATA_DIR}/coaches.json`, COACHES),
    safeFetchJson(`${DATA_DIR}/games.json`, []),
    safeFetchJson(`${DATA_DIR}/heisman.json`, []),
    safeFetchJson(`${DATA_DIR}/nationals.json`, []),
  ]);

  COLORS = colors || {};
  COACHES = Array.isArray(coaches) ? coaches : COACHES;
  GAMES = Array.isArray(games) ? games : [];
  HEISMAN = Array.isArray(heisman) ? heisman : [];
  NATIONALS = Array.isArray(nationals) ? nationals : [];

  renderLegend();
  renderFilters();
  renderGames();
  renderHeisman();
  renderNattys();

  coachFilter.addEventListener('change', renderGames);
  yearFilter.addEventListener('input', renderGames);

  tabGames.addEventListener('click', () => showPanel(true,false,false));
  tabHeisman.addEventListener('click', () => showPanel(false,true,false));
  tabNattys.addEventListener('click', () => showPanel(false,false,true));
};
document.addEventListener('DOMContentLoaded', init);
