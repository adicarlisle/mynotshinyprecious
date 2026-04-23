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
</style>

<article class="round padding">
  <h1>This isn't a Shiny app</h1>
  <h3>It's our own, our precious</h2>
</article>

<div class="space"></div>

<article class="round padding surface">
  <h5>The Journey to Mordor</h5>
  <div id="plot-div" style="width:100%;height:450px;cursor:default;"></div>
</article>

<div class="space"></div>

<footer class="round padding center-align">
  <p class="fire-text">Ash nazg durbatulûk, ash nazg gimbatul, ash nazg thrakatulûk agh burzum-ishi krimpatul.</p>
</footer>

<script src="assets/js/coi-serviceworker.js"></script>
<script src="https://cdn.plot.ly/plotly-2.32.0.min.js"></script>
<script type="module">
  import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';

  // ── webR init ────────────────────────────────────────────────────────────────
  const webR = new WebR();
  await webR.init();

  // ── fetch CSV and pass into R environment ────────────────────────────────────
  const csvText = await fetch('assets/route_distances.csv').then(r => r.text());
  await webR.evalR(`csv_text <- '${csvText}'`);

  // ── run analysis.R ───────────────────────────────────────────────────────────
  const rCode    = await fetch('assets/analysis.R').then(r => r.text());
  const shelter  = await new webR.Shelter();
  const rResult  = await shelter.evalR(rCode);
  const raw      = await rResult.toJs();
  shelter.purge();

  const densX = Array.from(raw.values[0].values);
  const densY = Array.from(raw.values[1].values);

  // ── waypoints ────────────────────────────────────────────────────────────────
  const waypoints = [
    { name: 'Hobbiton',       dist: 0       },
    { name: 'Bree',           dist: 79128   },
    { name: 'Weathertop',     dist: 163598  },
    { name: 'Rivendell',      dist: 368793  },
    { name: 'Caradhras',      dist: 487993  },
    { name: 'Caras Galadhon', dist: 575936  },
    { name: 'Rauros',         dist: 797301  },
    { name: 'Minas Tirith',   dist: 920261  },
    { name: 'Mt Doom',        dist: 1047945 }
  ];

  // find nearest density y value for a given x distance
  const snapToCurve = dist =>
    densY[densX.reduce((best, val, idx) =>
      Math.abs(val - dist) < Math.abs(densX[best] - dist) ? idx : best, 0
    )];

  // label each density point with its nearest waypoint name
  const hoverLabels = densX.map(x =>
    waypoints.reduce((a, b) =>
      Math.abs(b.dist - x) < Math.abs(a.dist - x) ? b : a
    ).name
  );

  // ── plot ─────────────────────────────────────────────────────────────────────
  Plotly.newPlot('plot-div', [
    {
      // density curve
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
      // waypoint markers
      x:             waypoints.map(w => w.dist),
      y:             waypoints.map(w => snapToCurve(w.dist)),
      type:          'scatter',
      mode:          'markers+text',
      name:          'Waypoints',
      text:          waypoints.map(w => w.name),
      textposition:  'top center',
      marker:        { color: '#ff4500', size: 8 },
      hovertemplate: '<b>%{text}</b><br>%{x:.0f}m from the Shire<extra></extra>'
    }
  ], {
    xaxis: {
      title:     'Distance from the Shire',
      tickvals:  [0, 200000, 400000, 600000, 800000, 1000000],
      ticktext:  ['0', '200km', '400km', '600km', '800km', '1,000km']
    },
    yaxis: {
      title:           'Time spent',
      showticklabels:  false
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor:  'transparent',
    font:          { color: 'inherit' },
    showlegend:    false,
    margin:        { b: 120 }
  }, { responsive: true });
</script>
