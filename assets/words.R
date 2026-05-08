data <- read.csv("https://raw.githubusercontent.com/jennybc/lotr/refs/heads/master/lotr_wordsSpoken.tsv", sep="\t")
frodo <- data[data$Character == "Frodo",]
barplot(
  frodo$Words,
  names.arg = frodo$Film,
  main = "Frodo's Words Spoken by Film",
  ylab = "Words",
  col = "steelblue",
  las = 2  # rotate x-axis labels
)