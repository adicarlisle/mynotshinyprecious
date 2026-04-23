---
layout: default
---

<style>
  .fire-text {
    display: block;
    background: linear-gradient(90deg, #ff4500, #ff8c00, #ffd700, #ff8c00, #ff4500);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fire-scroll 2s linear infinite;
  }

  @keyframes fire-scroll {
    0%   { background-position: 0%   center; }
    100% { background-position: 200% center; }
  }

  #wordcloud-modal {
    display: none;
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    z-index: 1000;
    align-items: center;
    justify-content: center;
  }

  #wordcloud-modal.open {
    display: flex;
  }

  #wordcloud-inner {
    position: relative;
    width: 90%;
    max-width: 700px;
  }

  #wordcloud-close {
    position: absolute;
    top: -2rem;
    right: 0;
    cursor: pointer;
    color: white;
    font-size: 1.5rem;
  }

  #wordcloud-canvas {
    width: 100%;
    border-radius: 12px;
  }

  .scatterlayer .trace:last-child .point path {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%   { opacity: 1;   transform: scale(1);   }
    50%  { opacity: 0.6; transform: scale(1.3); }
    100% { opacity: 1;   transform: scale(1);   }
  }
</style>

<article class="round padding">
  <h1>This isn't a Shiny app</h1>
  <h2>It's our own, our precious</h2>
</article>

<div class="space"></div>

<article class="round padding surface">
  <h5>The Journey to Mordor</h5>
  <p id="plot-status">Loading R environment...</p>
  <div id="plot-div" style="width:100%;height:450px;cursor:default;display:none;"></div>
</article>

<div class="space"></div>

<footer class="round padding center-align">
  <p class="fire-text">Ash nazg durbatulûk, ash nazg gimbatul, ash nazg thrakatulûk agh burzum-ishi krimpatul.</p>
</footer>

<!-- wordcloud modal -->
<div id="wordcloud-modal">
  <div id="wordcloud-inner">
    <span id="wordcloud-close">✕</span>
    <article class="round padding surface">
      <h5 id="wordcloud-title">Words of the Journey</h5>
      <p id="wordcloud-status"></p>
      <canvas id="wordcloud-canvas" width="800" height="400"></canvas>
    </article>
  </div>
</div>

<script src="assets/js/coi-serviceworker.js"></script>
<script src="https://cdn.plot.ly/plotly-2.32.0.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/wordcloud2.js/1.2.2/wordcloud2.min.js"></script>
<script type="module">
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

    const safeText = text.replace(/'/g, "\\'").replace(/\n/g, ' ');
    await webR.evalR(`section_text <- '${safeText}'`);

    const shelter2   = await new webR.Shelter();
    const freqResult = await shelter2.evalR(`
      library(tm)
      words <- unlist(strsplit(tolower(section_text), "\\\\W+"))
      words <- words[nchar(words) > 3]
      stops <- c(stopwords("en"), "that", "with", "have", "will", "your", "this", "from", "they", "what")
      words <- words[!words %in% stops]
      freq  <- sort(table(words), decreasing = TRUE)[1:100]
      list(words = names(freq), freqs = as.numeric(freq))
    `);
    const freqData = await freqResult.toJs();
    shelter2.purge();

    const words    = Array.from(freqData.values[0].values);
    const freqs    = Array.from(freqData.values[1].values);
    const wordList = words.map((w, i) => [w, freqs[i]]);

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
</script>
