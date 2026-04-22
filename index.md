---
layout: default
---
<style>
  .fire-text {
    background: linear-gradient(
      90deg,
      #ff4500,
      #ff8c00,
      #ffd700,
      #ff8c00,
      #ff4500
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fire-scroll 2s linear infinite;
  }

  @keyframes fire-scroll {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
</style>
<article class="round padding">
  <h1>This isn't a Shiny app</h1>
  <h2>It's our own, our precious</h2>
  <p class="fire-text">Ash nazg durbatulûk, ash nazg gimbatul, ash nazg thrakatulûk agh burzum-ishi krimpatul.</p>
</article>

<div class="space"></div>

  <article class="round padding surface">
    <h5>The Journey to Mordor</h5>
    <div id="plot-div" style="width:100%;height:450px;cursor:default;"></div>
  </article>

<script src="assets/js/coi-serviceworker.js"></script>
<script src="https://cdn.plot.ly/plotly-2.32.0.min.js"></script>

<div class="space"></div>

<script src="assets/js/coi-serviceworker.js"></script>
<script src="https://cdn.plot.ly/plotly-2.32.0.min.js"></script>
<script type="module">
  import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';

  const webR = new WebR();
  await webR.init();

  const csvRes = await fetch('assets/route_distances.csv');
  const csvText = await csvRes.text();
  await webR.evalR(`csv_text <- '${csvText}'`);

  const response = await fetch('assets/analysis.R');
  const rCode = await response.text();

  const shelter = await new webR.Shelter();
  const rResult = await shelter.evalR(rCode);
  const data = await rResult.toJs();
  shelter.purge();

  const waypoints = [
    { name: "Hobbiton",       dist: 0 },
    { name: "Bree",           dist: 79128 },
    { name: "Weathertop",     dist: 163598 },
    { name: "Rivendell",      dist: 368793 },
    { name: "Caradhras",      dist: 487993 },
    { name: "Caras Galadhon", dist: 575936 },
    { name: "Rauros",         dist: 797301 },
    { name: "Minas Tirith",   dist: 920261 },
    { name: "Mt Doom",        dist: 1047945 }
  ];

  Plotly.newPlot('plot-div', [
    {
      x: data.values[0].values,
      y: data.values[1].values,
      type: 'scatter',
      mode: 'lines',
      fill: 'tozeroy',
      name: 'Time spent',
      line: { color: '#6750a4', width: 2 },
      fillcolor: 'rgba(103, 80, 164, 0.2)',
      hovertemplate: '<b>%{text}</b><br>Distance: %{x:.0f}m<br>Density: %{y:.6f}<extra></extra>',
      text: data.values[0].values.map(x => {
        const nearest = waypoints.reduce((a, b) =>
          Math.abs(b.dist - x) < Math.abs(a.dist - x) ? b : a
        );
        return nearest.name;
      })
    },
    {
      x: waypoints.map(w => w.dist),
      y: waypoints.map(w => 0),
      mode: 'markers+text',
      type: 'scatter',
      name: 'Waypoints',
      text: waypoints.map(w => w.name),
      textposition: 'top center',
      marker: { color: '#ff4500', size: 8 },
      hovertemplate: '<b>%{text}</b><br>%{x:.0f}m from the Shire<extra></extra>'
    }
  ], {
    title: '',
    xaxis: {
      title: 'Distance from the Shire (m)',
      tickvals: waypoints.map(w => w.dist),
      ticktext: waypoints.map(w => w.name),
      tickangle: -45
    },
    yaxis: {
      title: 'Time spent (density)',
      showticklabels: false
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: 'inherit' },
    showlegend: false,
    margin: { b: 120 }
  }, { responsive: true });
</script>
