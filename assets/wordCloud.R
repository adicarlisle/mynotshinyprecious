library(tm)
words <- unlist(strsplit(tolower(text), "\\W+"))
words <- words[nchar(words) > 3]
stops <- c(stopwords("en"), "that", "with", "have", "will", "your", "this", "from", "they", "what")
words <- words[!words %in% stops]
freq  <- sort(table(words), decreasing = TRUE)[1:100]
mapply(list, names(freq), as.numeric(freq), SIMPLIFY = FALSE, USE.NAMES = FALSE)

