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

  #wordcloud-modal {
    display: none;
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    z-index: 1000;
    align-items: center;
    justify-content: center;
  }

  #wordcloud-modal.open {
    display: flex;
  }

  #wordcloud-inner {
    position: relative;
    width: 90%;
    max-width: 700px;
  }

  #wordcloud-close {
    position: absolute;
    top: -2rem;
    right: 0;
    cursor: pointer;
    color: white;
    font-size: 1.5rem;
  }

  #wordcloud-canvas {
    width: 100%;
    border-radius: 12px;
  }

  .scatterlayer .trace:last-child .point path {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%   { opacity: 1;   transform: scale(1);   }
    50%  { opacity: 0.6; transform: scale(1.3); }
    100% { opacity: 1;   transform: scale(1);   }
  }
</style>

<article class="round padding">
  <h1>This isn't a Shiny app, it's our own, our... precious</h1>
</article>

<div class="space"></div>

<article class="round padding surface">
  <h5>The Journey to Mordor</h5>
  <p id="plot-status">Loading R environment...</p>
  <div id="plot-div" style="width:100%;height:450px;cursor:default;display:none;"></div>
</article>

<div class="space"></div>

<footer class="round padding center-align">
  <p class="fire-text">Ash nazg durbatulûk, ash nazg gimbatul, ash nazg thrakatulûk agh burzum-ishi krimpatul.</p>
</footer>

<!-- wordcloud modal -->
<div id="wordcloud-modal">
  <div id="wordcloud-inner">
    <span id="wordcloud-close">✕</span>
    <article class="round padding surface">
      <h5 id="wordcloud-title">Words of the Journey</h5>
      <p id="wordcloud-status"></p>
      <canvas id="wordcloud-canvas" width="800" height="400"></canvas>
    </article>
  </div>
</div>

<script src="assets/js/coi-serviceworker.js"></script>
<script src="https://cdn.plot.ly/plotly-2.32.0.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/wordcloud2.js/1.2.2/wordcloud2.min.js"></script>
<script type="module" src="assets/js/main.js"></script>
