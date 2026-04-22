---
layout: default
---

# Lorem Ipsum

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Section Two

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

<div id="plot-div" style="width:100%;height:450px;"></div>

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

<style>
  #plot-div {
    cursor: default;
  }
</style>
