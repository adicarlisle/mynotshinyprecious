---
layout: default
---

<div id="plot-div" style="width: 100%; height: 500px;"></div>
<p>Status: <span id="status">loading WebR...</span></p>

<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script type="module">
  import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';

  const webR = new WebR();
  await webR.init();

  document.getElementById('status').innerText = 'running analysis...';

  // Fetch and run your R script
  const response = await fetch('assets/analysis.R');
  const rCode = await response.text();
  
  // Evaluate R code and get results as JSON
  const result = await webR.evalJson(`
    ${rCode}
    list(x = x, y = y)
  `);

  // Create Plotly visualization
  const trace = {
    x: result.x,
    y: result.y,
    type: 'scatter',
    mode: 'lines+markers',
    name: 'sin(x)',
    line: {
      color: 'steelblue',
      width: 2
    },
    marker: {
      size: 4
    }
  };

  const layout = {
    title: 'Sine Wave - Interactive Chart',
    xaxis: { title: 'x' },
    yaxis: { title: 'sin(x)' },
    hovermode: 'closest'
  };

  Plotly.newPlot('plot-div', [trace], layout, {responsive: true});

  document.getElementById('status').innerText = 'done!';
</script>