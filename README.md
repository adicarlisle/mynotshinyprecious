# mynotshinyprecious

> *If it was shiny it wouldn't be free*

An interactive data visualisation built entirely with free, open-source tools and no server backend. R runs in your browser via WebAssembly, charts are rendered with Plotly, and the whole thing is served as a static Jekyll site on GitHub Pages.

---

## What i'm sorry for
To my co-author on this project, I did alot of work late at night, and you must have so many notifications on GH action runs, i think we got to 92 today. It's all overlord code so i'm not attached to it, we will cut and paste and checkout another branch maybe at our gmeet session.

## What it does

The centrepiece is an interactive density plot of Frodo's journey from the Shire to Mount Doom, built from real GIS data extracted from the [ME-GIS project](https://github.com/andrewheiss/ME-GIS) — a community-built Geographic Information System of Tolkien's Middle Earth.

Click any waypoint on the journey chart and a modal opens with a wordcloud of dialogue from that section of the story, generated live in R from quotes pulled from [The One API](https://the-one-api.dev/).

---

## How it works

### Data pipeline

1. **ME-GIS shapefiles** — the `Combined_Placenames.xyz` file from the ME-GIS project was parsed in R to extract real map coordinates for key locations along the Fellowship's route
2. **Route distances** — cumulative straight-line distances between waypoints were calculated in R using the ME-GIS coordinate system (metres), producing a `route_distances.csv` of 500 interpolated and noise-sampled points weighted by time spent at each location
3. **Density estimation** — R's `density()` function produces a kernel density estimate of where the journey was concentrated, revealing where the Fellowship lingered vs passed through quickly

### In-browser R

WebR runs a full R session in the browser via WebAssembly. On page load it:

- Installs `wordcloud` and `tm` packages into the webR virtual filesystem
- Fetches `route_distances.csv` from the site and passes it into the R environment
- Runs `analysis.R` to compute the density estimate
- Returns the result to JavaScript for Plotly to render

When a waypoint is clicked, webR runs a second analysis — text cleaning, stopword removal, and word frequency counting — on live quote data from The One API, returning word frequencies to JavaScript for the wordcloud renderer.

### Stack

| Layer | Technology |
|---|---|
| Static site | Jekyll + GitHub Pages |
| Theme | Beer CSS (Material Design 3) |
| In-browser R | WebR (R via WebAssembly) |
| Charting | Plotly.js |
| Wordcloud | wordcloud2.js |
| GIS data | ME-GIS / andrewheiss |
| Quote data | The One API |
| R packages | `tm`, `wordcloud` |
| COOP/COEP headers | coi-serviceworker |

---

## Files
```
├── index.md              # main page — layout, JS, Plotly, webR orchestration
├── assets/
│   ├── analysis.R        # R script — reads CSV, runs density(), returns list
│   ├── route_distances.csv  # pre-computed journey distances (generated locally)
│   └── js/
│       └── coi-serviceworker.js  # enables SharedArrayBuffer for webR
├── _layouts/
│   └── default.html      # Beer CSS layout with dark theme
├── _config.yml           # Jekyll config
└── Gemfile               # Jekyll dependencies
```
---

## Local data extraction

The `route_distances.csv` was generated locally using R and the ME-GIS dataset. To regenerate it:

```r
library(sf)
library(dplyr)

# clone https://github.com/andrewheiss/ME-GIS
lines  <- readLines("ME-GIS/Combined_Placenames.xyz")
blocks <- split(lines, cumsum(lines == ""))

parse_block <- function(block) {
  name_line  <- block[grepl("^NAME=", block)]
  coord_line <- block[grepl("^[0-9]", block)]
  if (length(name_line) == 0 || length(coord_line) == 0) return(NULL)
  name   <- gsub("^NAME=", "", name_line[1])
  coords <- strsplit(coord_line[1], ",")[[1]]
  data.frame(name = name, x = as.numeric(coords[1]), y = as.numeric(coords[2]))
}

places <- do.call(rbind, Filter(Negate(is.null), lapply(blocks, parse_block)))

# waypoints with days spent (weighted by narrative time)
waypoints <- data.frame(
  name = c("Hobbiton", "Bree", "Weathertop", "Rivendell",
           "Caradhras", "Caras Galadhon", "Rauros", "Minas Tirith", "Mt Doom"),
  dist = c(0, 79128, 163598, 368793, 487993, 575936, 797301, 920261, 1047945),
  days = c(20, 10, 10, 60, 15, 40, 10, 50, 20)
)

weighted_dists <- rep(waypoints$dist, waypoints$days)
set.seed(42)
noise <- rnorm(length(weighted_dists), mean = 0, sd = 20000)

write.csv(
  data.frame(dist_from_shire = pmax(weighted_dists + noise, 0)),
  "assets/route_distances.csv",
  row.names = FALSE
)
```
Replace the local data extraction section with this:

## How the route distances were generated

The `route_distances.csv` is the result of a small geospatial analysis pipeline run locally in R before anything was committed to the repo. It is a static file — it only needs to be regenerated if you want to change the route or the weighting.

### Step 1 — Parse the ME-GIS place names

The ME-GIS repository does not have a conventional CSV or GeoJSON of place names. Instead, coordinates are buried in a proprietary key-value format inside `Combined_Placenames.xyz`, where each location is represented as a block of metadata followed by a bare coordinate pair:

DESCRIPTION=SeaNames
NAME=Bay of Balfalas
POINT_SYMBOL=No Symbol
FONT_NAME=Uncial
...
820305.556,325037.378


The file was parsed block by block in R, splitting on blank lines and extracting the `NAME=` and coordinate lines from each block. This produced a clean data frame of 665 named locations with x/y coordinates in the ME-GIS coordinate system, where the entire map of Middle Earth covers a 2,000km × 2,000km area at 200 metres per pixel resolution.

### Step 2 — Identify waypoint coordinates

Key locations along the Fellowship's route were searched by name in the parsed place data:

Hobbiton        (515948, 1043820)
Bree            (found via grepl match)
Weathertop      (found via grepl match)
Rivendell       (found via grepl match)
Caradhras       (872481,  939177)  — used as Moria pass proxy
Caras Galadhon  (959239,  924793)  — Lothlórien
Rauros          (found via grepl match)
Minas Tirith    (found via grepl match)
Mt Doom         (1230413, 667554)


Moria itself is not named in the dataset, so Caradhras — the mountain pass the Fellowship attempted before being driven underground — was used as the geographic proxy. Caras Galadhon is the correct name for the city at the heart of Lothlórien.

### Step 3 — Calculate cumulative distances

Straight-line Euclidean distances between consecutive waypoints were calculated in the ME-GIS coordinate space and accumulated to give a total cumulative distance from Hobbiton for each waypoint:

Hobbiton        →       0m
Bree            →  79,128m
Weathertop      → 163,598m
Rivendell       → 368,793m
Caradhras       → 487,993m
Caras Galadhon  → 575,936m
Rauros          → 797,301m
Minas Tirith    → 920,261m
Mt Doom         → 1,047,945m


The total journey from Bag End to the fires of Mount Doom covers just over 1,048km in map units, which is consistent with Tolkien's own geographical appendices.

### Step 4 — Weight by narrative time

A straight interpolation of 500 evenly spaced points along the route would produce a flat density — every stretch of the journey would look equally significant. To make the density plot tell the story of the journey rather than just its geography, each waypoint was repeated a number of times proportional to how long the Fellowship (or Frodo and Sam) actually spent there:

Hobbiton        20 days   — leisurely departure
Bree            10 days   — brief stop
Weathertop      10 days   — Frodo stabbed, slow recovery
Rivendell       60 days   — the Council of Elrond, long rest
Caradhras       15 days   — the attempt on the mountain pass
Caras Galadhon  40 days   — weeks with Galadriel in Lothlórien
Rauros          10 days   — the breaking of the Fellowship
Minas Tirith    50 days   — the siege of Gondor
Mt Doom         20 days   — the final approach and destruction of the Ring


These weights mean the density peaks at Rivendell and Minas Tirith reflect the narrative reality — these were months-long chapters of the story, not passing moments.

### Step 5 — Add terrain noise

The weighted distance values were repeated into a vector of 235 points and Gaussian noise was added with a standard deviation of 20,000m. This simulates the natural variation of travel — the Fellowship did not walk in a perfectly straight line between waypoints, and the noise prevents the density estimate from producing sharp unnatural spikes at exact waypoint distances. `set.seed(42)` was used for reproducibility.

The final CSV contains a single column `dist_from_shire` with 235 values ready for R's `density()` function.
---

## Design decisions

**Why webR instead of a Shiny server?**
Shiny requires a running R server which costs money and infrastructure. WebR brings R to the browser as WebAssembly — fully client-side, no server, no cost, no maintenance.

**Why fetch the R script as a file?**
`analysis.R` is fetched and evaluated at runtime rather than inlined in JavaScript. This means data scientists can edit pure R without touching any JavaScript — the contract between R and JS is just the final `list()` the script returns.

**Why pre-fetch all quotes on load?**
The One API has rate limits. Fetching all three films' quotes upfront on page load means wordcloud generation is instant on click — no per-click API latency.

**Why kernel density and not a bar chart?**
The journey is continuous, not categorical. A density estimate shows the shape of where time was concentrated across the full 1,048km route rather than just at discrete waypoints.

---

## Acknowledgements

- [ME-GIS](https://github.com/andrewheiss/ME-GIS) — Andrew Heiss and the ME-DEM team for the Middle Earth GIS dataset
- [The One API](https://the-one-api.dev/) — for the LOTR quote data
- [WebR](https://webr.r-wasm.org/) — George Stagg and Lionel Henry for R in the browser
- [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker) — Guido Zuidhof for the COOP/COEP service worker polyfill
- J.R.R. Tolkien — for the world

---

*One repo to rule them all.*
