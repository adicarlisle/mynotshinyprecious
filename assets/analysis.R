# Generate some data
x <- seq(0, 2 * pi, length.out = 100)
y <- sin(x)

# Return data for Plotly visualization
list(x = x, y = y)