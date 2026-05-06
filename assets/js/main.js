import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';

const DEMON_MAGIC = 'eCsax85_YfFx4fW6Ao88';

const FILMS = {
  fellowship: '5cd95395de30eff6ebccde5c',
  towers:     '5cd95395de30eff6ebccde5b',
  king:       '5cd95395de30eff6ebccde5d'
};

const waypoints = [
  { name: 'Hobbiton',       dist: 0,       film: 'fellowship' },
  { name: 'Bree',           dist: 79128,   film: 'fellowship' },
  { name: 'Weathertop',     dist: 163598,  film: 'fellowship' },
  { name: 'Rivendell',      dist: 368793,  film: 'fellowship' },
  { name: 'Caradhras',      dist: 487993,  film: 'fellowship' },
  { name: 'Caras Galadhon', dist: 575936,  film: 'fellowship' },
  { name: 'Rauros',         dist: 797301,  film: 'towers'     },
  { name: 'Minas Tirith',   dist: 920261,  film: 'king'       },
  { name: 'Mt Doom',        dist: 1047945, film: 'king'       }
];

// ── webR init ────────────────────────────────────────────────────────────────
const webR = new WebR();
await webR.init();

// ── pre-install packages ─────────────────────────────────────────────────────
document.getElementById('plot-status').textContent = 'Installing R packages...';
await webR.evalR(`
  webr::install('wordcloud')
  webr::install('tm')
`);

// ── fetch CSV and run density analysis ───────────────────────────────────────
document.getElementById('plot-status').textContent = 'Running analysis...';
const csvText = await fetch('assets/route_distances.csv').then(r => r.text());
await webR.evalR(`csv_text <- '${csvText}'`);

const rCode   = await fetch('assets/analysis.R').then(r => r.text());
const shelter = await new webR.Shelter();
const rResult = await shelter.evalR(rCode);
const raw     = await rResult.toJs();
shelter.purge();

const densX = Array.from(raw.values[0].values);
const densY = Array.from(raw.values[1].values);

// ── fetch all quotes upfront ─────────────────────────────────────────────────
document.getElementById('plot-status').textContent = 'Fetching quotes from Middle Earth...';

const fetchQuotes = async (filmId) => {
  const res  = await fetch(`https://the-one-api.dev/v2/movie/${filmId}/quote?limit=1000`, {
    headers: { Authorization: `Bearer ${DEMON_MAGIC}` }
  });
  const json = await res.json();
  return json.docs.map(q => q.dialog).join(' ');
};

const quoteCache = {
  fellowship: await fetchQuotes(FILMS.fellowship),
  towers:     await fetchQuotes(FILMS.towers),
  king:       await fetchQuotes(FILMS.king)
};

// ── render journey plot ──────────────────────────────────────────────────────
document.getElementById('plot-status').remove();
document.getElementById('plot-div').style.display = 'block';

const snapToCurve = dist =>
  densY[densX.reduce((best, val, idx) =>
    Math.abs(val - dist) < Math.abs(densX[best] - dist) ? idx : best, 0
  )];

const hoverLabels = densX.map(x =>
  waypoints.reduce((a, b) =>
    Math.abs(b.dist - x) < Math.abs(a.dist - x) ? b : a
  ).name
);

const plotDiv = document.getElementById('plot-div');

Plotly.newPlot(plotDiv, [
  {
    x:             densX,
    y:             densY,
    type:          'scatter',
    mode:          'lines+markers',
    fill:          'tozeroy',
    name:          'Time spent',
    line:          { color: '#6750a4', width: 2 },
    fillcolor:     'rgba(103, 80, 164, 0.2)',
    marker:        { color: '#6750a4', size: 3 },
    text:          hoverLabels,
    hovertemplate: '<b>%{text}</b><br>Distance: %{x:.0f}m<br>Density: %{y:.6f}<extra></extra>'
  },
  {
    x:             waypoints.map(w => w.dist),
    y:             waypoints.map(w => snapToCurve(w.dist)),
    type:          'scatter',
    mode:          'markers+text',
    name:          'Waypoints',
    text:          waypoints.map(w => w.name),
    textposition:  'top center',
    marker:        { color: '#ff4500', size: 12, line: { color: '#ffd700', width: 2 }, symbol: 'circle' },
    hovertemplate: '<b>%{text}</b><br>%{x:.0f}m from the Shire<br><i>Click to explore words</i><extra></extra>'
  }
], {
  xaxis: {
    title:    'Distance from the Shire',
    tickvals: [0, 200000, 400000, 600000, 800000, 1000000],
    ticktext: ['0', '200km', '400km', '600km', '800km', '1,000km']
  },
  yaxis: {
    title:          'Time spent',
    showticklabels: false
  },
  paper_bgcolor: 'transparent',
  plot_bgcolor:  'transparent',
  font:          { color: '#e6e1e5' },
  showlegend:    false,
  margin:        { b: 120 }
}, { responsive: true });

// ── cursor change on waypoint hover ──────────────────────────────────────────
plotDiv.on('plotly_hover', (event) => {
  if (event.points[0].curveNumber === 1) {
    plotDiv.style.cursor = 'pointer';
  }
});

plotDiv.on('plotly_unhover', () => {
  plotDiv.style.cursor = 'default';
});

// ── modal controls ───────────────────────────────────────────────────────────
const modal       = document.getElementById('wordcloud-modal');
const modalTitle  = document.getElementById('wordcloud-title');
const modalStatus = document.getElementById('wordcloud-status');
const modalCanvas = document.getElementById('wordcloud-canvas');
const modalClose  = document.getElementById('wordcloud-close');

modalClose.addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', e => {
  if (e.target === modal) modal.classList.remove('open');
});

// ── wordcloud on waypoint click ──────────────────────────────────────────────
plotDiv.on('plotly_click', async (event) => {
  const point = event.points[0];
  if (point.curveNumber !== 1) return;

  const wp   = waypoints[point.pointIndex];
  const text = quoteCache[wp.film];

  modalTitle.textContent  = `${wp.name} — Words of the Journey`;
  modalStatus.textContent = 'Generating wordcloud...';
  modal.classList.add('open');
  const anotherRCode = await fetch("assets/wordCloud.R").then(r => r.text());

  const shelter2   = await new webR.Shelter();
  const rObj = await new shelter2.RObject(text);
  const freqResult = await shelter2.evalR(anotherRCode, {
    env: {text: rObj}
  });
  const freqData = await freqResult.toJs();
  shelter2.purge();

  // Each item in freqData.values is a list of two length-1 vectors: [word, freq]
  const wordList = freqData.values.map(item => [
    item.values[0].values[0], 
    item.values[1].values[0]
  ]);
  modalStatus.textContent = '';

  const ctx = modalCanvas.getContext('2d');
  ctx.clearRect(0, 0, modalCanvas.width, modalCanvas.height);

  WordCloud(modalCanvas, {
    list:            wordList,
    gridSize:        8,
    weightFactor:    6,
    fontFamily:      'sans-serif',
    color:           () => ['#6750a4','#ff4500','#ff8c00','#ffd700'][Math.floor(Math.random()*4)],
    backgroundColor: 'transparent',
    rotateRatio:     0.3
  });
});
