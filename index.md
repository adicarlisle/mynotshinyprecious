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
  <title>This isn't a Shiny app</title>
  <h1>It's our own, our precious</h1>
  <p class="fire-text>Ash nazg durbatulûk, ash nazg gimbatul, ash nazg thrakatulûk agh burzum-ishi krimpatul.</p>
</article>

<div class="space"></div>

<article class="round padding surface">
  <h5> Sine Wave </h5>
  <div id="plot-div" style="width:100%;height:450px;cursor:default;"></div>
</article>
<script src="assets/js/coi-serviceworker.js"></script>
<script src="https://cdn.plot.ly/plotly-2.32.0.min.js"></script>
<script type="module">
  import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';

  const webR = new WebR();
  await webR.init();

  const response = await fetch('assets/analysis.R');
  const rCode = await response.text();

  const shelter = await new webR.Shelter();
  const rResult = await shelter.evalR(rCode);
  const data = await rResult.toJs();
  shelter.purge();

  Plotly.newPlot('plot-div', [{
    x: data.values[0].values,
    y: data.values[1].values,
    type: 'scatter',
    mode: 'lines+markers',
    name: 'sin(x)',
    line: { color: 'steelblue', width: 2 },
    marker: { size: 4 }
  }], {
    title: 'Sine Wave',
    xaxis: { title: 'x' },
    yaxis: { title: 'sin(x)' }
  }, { responsive: true });
</script>
