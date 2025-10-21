// --- Configure this to your repo path ---
const SUBMIT_URL = 'https://github.com/dstaggs-15/cfb26/issues/new?template=submit.yml';

// Always set the link immediately so it works even if data loading fails
const submitLink = document.getElementById('submitLink');
if (submitLink) submitLink.href = SUBMIT_URL;

// Small helper: safe fetch that returns a default value on error
async function loadJson(path, fallback) {
  try {
    const r = await fetch(path, { cache: 'no-store' });
    if (!r.ok) throw new Error(`${path} -> ${r.status}`);
    return await r.json();
  } catch (e) {
    console.error('Failed to load', path, e);
    return fallback;
  }
}

(async () => {
  // Load everything with safe fallbacks so the rest of the code still runs
  const colors   = await loadJson('./data/colors.json',   {});
  const coaches  = await loadJson('./data/coaches.json',  []);
  const games    = await loadJson('./data/games.json',    []);
  const heisman  = await loadJson('./data/heisman.json',  []);
  const nationals= await loadJson('./data/nationals.json',[]);

  // Tabs
  const tabs = { tabGames: 'panelGames', tabHeisman: 'panelHeisman', tabNattys: 'panelNattys' };
  Object.entries(tabs).forEach(([btnId, panelId]) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.onclick = () => {
      Object.values(tabs).forEach(id => document.getElementById(id)?.classList.add('hidden'));
      document.getElementById(panelId)?.classList.remove('hidden');
    };
  });

  // Filters
  const coachFilter = document.getElementById('coachFilter');
  const yearFilter  = document.getElementById('yearFilter');

  // Populate coach list
  if (coachFilter) {
    const coachNames = coaches.map(c => c.name);
    coachFilter.innerHTML = ['All', ...coachNames].map(n => `<option>${n}</option>`).join('');
  }

  // Legend
  const legend = document.getElementById('legend');
  if (legend) {
    Object.entries(colors).forEach(([team, palette]) => {
      const chip = document.createElement('div');
      chip.className = 'px-2 py-1 rounded-lg border border-white/10';
      chip.style.background = palette?.primary || '#374151';
      chip.style.color = '#fff';
      chip.innerHTML = `<span class="font-semibold">${team}</span>`;
      legend.appendChild(chip);
    });
  }

  // UI helpers
  const teamBadge = (team) => {
    const palette = colors[team] || { primary: '#374151' };
    return `<span class="px-2 py-1 rounded-md text-xs font-semibold" style="background:${palette.primary};color:#fff">${team}</span>`;
  };
  const applyFilters = (rows, coachKey, yearKey) => {
    const coachVal = coachFilter?.value || 'All';
    const yearVal  = (yearFilter?.value || '').trim();
    return rows.filter(r => {
      const coachPass = coachVal === 'All' || r[coachKey]?.includes(coachVal);
      const yearPass  = !yearVal || String(r[yearKey]) === String(yearVal);
      return coachPass && yearPass;
    });
  };

  // Renderers
  const gamesBody   = document.getElementById('gamesBody');
  const heismanBody = document.getElementById('heismanBody');
  const nattyBody   = document.getElementById('nattyBody');

  const renderGames = () => {
    if (!gamesBody) return;
    gamesBody.innerHTML = '';
    applyFilters(games, 'coaches', 'year').sort((a,b)=>b.year-a.year).forEach(g => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-white/5';
      tr.innerHTML = `
        <td class="p-3">${g.year ?? ''}</td>
        <td class="p-3">${g.homeCoach ?? ''}</td>
        <td class="p-3">${g.awayCoach ?? ''}</td>
        <td class="p-3 flex gap-2 items-center">${teamBadge(g.homeTeam || '')}<span class="text-subtle text-xs">vs</span>${teamBadge(g.awayTeam || '')}</td>
        <td class="p-3">${(g.homeScore ?? '')}-${(g.awayScore ?? '')}</td>
        <td class="p-3 font-semibold">${g.winner ?? ''}</td>`;
      gamesBody.appendChild(tr);
    });
  };

  const renderHeisman = () => {
    if (!heismanBody) return;
    heismanBody.innerHTML = '';
    applyFilters(heisman, 'coach', 'year').sort((a,b)=>b.year-a.year).forEach(h => {
      heismanBody.innerHTML += `
        <tr class="border-b border-white/5">
          <td class="p-3">${h.year ?? ''}</td>
          <td class="p-3">${h.player ?? ''}</td>
          <td class="p-3">${teamBadge(h.school || '')}</td>
        </tr>`;
    });
  };

  const renderNattys = () => {
    if (!nattyBody) return;
    nattyBody.innerHTML = '';
    applyFilters(nationals, 'coach', 'year').sort((a,b)=>b.year-a.year).forEach(n => {
      nattyBody.innerHTML += `
        <tr class="border-b border-white/5">
          <td class="p-3">${n.year ?? ''}</td>
          <td class="p-3">${teamBadge(n.team || '')}</td>
          <td class="p-3">${n.coach ?? ''}</td>
          <td class="p-3">${n.record ?? ''}</td>
        </tr>`;
    });
  };

  coachFilter?.addEventListener('change', ()=>{renderGames();renderHeisman();renderNattys();});
  yearFilter?.addEventListener('input',  ()=>{renderGames();renderHeisman();renderNattys();});

  renderGames(); renderHeisman(); renderNattys();
})();
