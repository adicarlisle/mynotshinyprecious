---
layout: default
---

<script type="module">
  import { WebR } from 'https://webr.r-wasm.org/latest/webr.mjs';
  const webR = new WebR();
  await webR.init();
  const result = await webR.evalR('1 + 1');
  document.getElementById('output').innerText = await result.toNumber();
</script>

<p>Result: <span id="output">loading...</span></p>
