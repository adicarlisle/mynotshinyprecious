---
layout: default
---

<canvas id="plot-canvas" width="600" height="400"></canvas>
<p>Status: <span id="status">loading WebR...</span></p>

<script type="module">
  import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';

  const webR = new WebR();
  await webR.init();

  document.getElementById('status').innerText = 'running...';

  // Set up WebR canvas device pointed at your canvas element
  const canvas = document.getElementById('plot-canvas');
  await webR.evalRVoid(`webr::canvas(width=600, height=400)`);

  // Fetch and run your R script
  const response = await fetch('assets/analysis.R');
  const rCode = await response.text();
  await webR.evalRVoid(rCode);

  // Flush plot output to the canvas element
  const msgs = await webR.flush();
  for (const msg of msgs) {
    if (msg.type === 'canvas' && msg.data.event === 'canvasImage') {
      const ctx = canvas.getContext('2d');
      ctx.drawImage(msg.data.image, 0, 0);
    }
  }

  document.getElementById('status').innerText = 'done';
</script>
