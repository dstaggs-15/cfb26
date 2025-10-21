(async () => {
  const [colors, coaches, games, heisman, nationals] = await Promise.all([
    fetch('./data/colors.json').then(r => r.json()),
    fetch('./data/coaches.json').then(r => r.json()),
    fetch('./data/games.json').then(r => r.json()),
    fetch('./data/heisman.json').then(r => r.json()),
    fetch('./data/nationals.json').then(r => r.json()),
  ]);

  const tabs = { tabGames: 'panelGames', tabHeisman: 'panelHeisman', tabNattys: 'panelNattys' };
  Object.entries(tabs).forEach(([b,p])=>{
    document.getElementById(b).onclick=()=>{Object.values(tabs).forEach(id=>document.getElementById(id).classList.add('hidden'));document.getElementById(p).classList.remove('hidden');};
  });

  const coachFilter=document.getElementById('coachFilter');
  const coachNames=coaches.map(c=>c.name);
  coachFilter.innerHTML=['All',...coachNames].map(n=>`<option>${n}</option>`).join('');
  const yearFilter=document.getElementById('yearFilter');

  const legend=document.getElementById('legend');
  Object.entries(colors).forEach(([team,palette])=>{
    const chip=document.createElement('div');
    chip.className='px-2 py-1 rounded-lg border border-white/10';
    chip.style.background=palette.primary;
    chip.style.color='#fff';
    chip.innerHTML=`<span class="font-semibold">${team}</span>`;
    legend.appendChild(chip);
  });

  const teamBadge=(team)=>{
    const palette=colors[team]||{primary:'#374151'};
    return `<span class="px-2 py-1 rounded-md text-xs font-semibold" style="background:${palette.primary};color:#fff">${team}</span>`;
  };
  const applyFilters=(rows,coachKey,yearKey)=>{
    const coachVal=coachFilter.value,yearVal=yearFilter.value.trim();
    return rows.filter(r=>{
      const coachPass=coachVal==='All'||r[coachKey]?.includes(coachVal);
      const yearPass=!yearVal||String(r[yearKey])===String(yearVal);
      return coachPass&&yearPass;
    });
  };

  const gamesBody=document.getElementById('gamesBody');
  const renderGames=()=>{
    gamesBody.innerHTML='';
    applyFilters(games,'coaches','year').sort((a,b)=>b.year-a.year).forEach(g=>{
      const tr=document.createElement('tr');tr.className='border-b border-white/5';
      tr.innerHTML=`<td class="p-3">${g.year}</td>
        <td class="p-3">${g.homeCoach}</td><td class="p-3">${g.awayCoach}</td>
        <td class="p-3 flex gap-2 items-center">${teamBadge(g.homeTeam)}<span class="text-subtle text-xs">vs</span>${teamBadge(g.awayTeam)}</td>
        <td class="p-3">${g.homeScore}-${g.awayScore}</td><td class="p-3 font-semibold">${g.winner}</td>`;
      gamesBody.appendChild(tr);
    });
  };

  const heismanBody=document.getElementById('heismanBody');
  const renderHeisman=()=>{
    heismanBody.innerHTML='';
    applyFilters(heisman,'coach','year').sort((a,b)=>b.year-a.year).forEach(h=>{
      heismanBody.innerHTML+=`<tr class="border-b border-white/5"><td class="p-3">${h.year}</td><td class="p-3">${h.player}</td><td class="p-3">${teamBadge(h.school)}</td></tr>`;
    });
  };

  const nattyBody=document.getElementById('nattyBody');
  const renderNattys=()=>{
    nattyBody.innerHTML='';
    applyFilters(nationals,'coach','year').sort((a,b)=>b.year-a.year).forEach(n=>{
      nattyBody.innerHTML+=`<tr class="border-b border-white/5"><td class="p-3">${n.year}</td><td class="p-3">${teamBadge(n.team)}</td><td class="p-3">${n.coach}</td><td class="p-3">${n.record}</td></tr>`;
    });
  };

  coachFilter.onchange=()=>{renderGames();renderHeisman();renderNattys();};
  yearFilter.oninput=()=>{renderGames();renderHeisman();renderNattys();};

  renderGames();renderHeisman();renderNattys();

  const submitLink=document.getElementById('submitLink');
  submitLink.href='https://github.com/USERNAME/ea-cfb26-dynasty/issues/new?template=submit.yml'; // replace USERNAME
})();
