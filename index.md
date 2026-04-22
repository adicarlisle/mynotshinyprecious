---
layout: default
---

<article class="round padding">
  <h1>Lorem Ipsum</h1>
  <p>Lorem ipsum dolor sit amet...</p>
</article>

<div class="space"></div>

<article class="round padding">
  <h2>Section Two</h2>
  <p>Sed ut perspiciatis...</p>
</article>

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
