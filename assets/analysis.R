# Generate some data
x <- seq(0, 2 * pi, length.out = 100)
y <- sin(x)

# Plot
plot(x, y,
  type = "l",
  col = "steelblue",
  lwd = 2,
  main = "Sine Wave",
  xlab = "x",
  ylab = "sin(x)"
)
