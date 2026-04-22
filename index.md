---
layout: default
---

<script type="module">
  import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';
  const webR = new WebR();
  await webR.init();

  const response = await fetch('/assets/analysis.R');
  const rCode = await response.text();

  const result = await webR.evalR(rCode);
  document.getElementById('output').innerText = await result.toNumber();
</script>

<p>Result: <span id="output">loading...</span></p>
