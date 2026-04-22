# notshiny
If it was shiny it wouldn't be free

## Overview

This project demonstrates an interactive web-based data visualization using WebR and Plotly. It runs R code directly in your browser without any server backend!

## Features

- **WebR**: Execute R code in the browser using WebAssembly
- **Plotly**: Interactive charts and graphs with hover, zoom, and pan capabilities
- **Sine Wave Visualization**: Displays an animated sine wave chart generated from R code

## How It Works

1. The R script (`assets/analysis.R`) generates x and y coordinates for a sine wave
2. WebR evaluates the R code and returns the data as JSON
3. Plotly renders the interactive chart in the browser
4. No server-side processing required!

## Technologies

- [WebR](https://webr.r-wasm.org/) - R running in WebAssembly
- [Plotly](https://plotly.com/) - Interactive graphing library
- R - Statistical computing language
- Jekyll - Static site generator

## Files

- `index.md` - Main page with the visualization and lorem ipsum content
- `assets/analysis.R` - R script that generates the sine wave data
- `_config.yml` - Jekyll configuration