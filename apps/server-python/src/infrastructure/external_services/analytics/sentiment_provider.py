from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_analyzer = None


def _get_analyzer():
  global _analyzer
  if _analyzer is None:
    _analyzer = SentimentIntensityAnalyzer()
  return _analyzer


class SentimentProvider:
  def score(self, text: str) -> dict:
    analyzer = _get_analyzer()
    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]
    if compound >= 0.05:
      label = "positive"
    elif compound <= -0.05:
      label = "negative"
    else:
      label = "neutral"
    return {
      "compound": compound,
      "negative": scores["neg"],
      "neutral": scores["neu"],
      "positive": scores["pos"],
      "label": label,
      "market_sentiment": label,
    }
