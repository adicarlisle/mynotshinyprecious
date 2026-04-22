---
layout: default
---

# Lorem Ipsum

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Section Two

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

<div id="plot-div" style="width: 100%; height: 500px;"></div>

<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script type="module">
  import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';

  const webR = new WebR();
  await webR.init();

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
</script>