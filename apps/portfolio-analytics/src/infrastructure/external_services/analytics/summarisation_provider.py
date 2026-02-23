import re


def _ensure_nltk():
  try:
    import nltk
    nltk.data.find("tokenizers/punkt")
  except LookupError:
    import nltk
    nltk.download("punkt", quiet=True)


class SummarisationProvider:
  def summarise(self, text: str, max_sentences: int = 3) -> dict:
    if not text or not text.strip():
      return {"summary": "", "max_sentences": max_sentences}
    try:
      _ensure_nltk()
      from sumy.nlp.tokenizers import Tokenizer
      from sumy.parsers.plaintext import PlaintextParser
      from sumy.summarizers.lex_rank import LexRankSummarizer
      parser = PlaintextParser.from_string(text.strip(), Tokenizer("english"))
      summarizer = LexRankSummarizer()
      sentences = summarizer(parser.document, max_sentences)
      summary = " ".join(str(s) for s in sentences)
      return {"summary": summary, "max_sentences": max_sentences}
    except Exception:
      sentences = [s.strip() for s in re.split(r"[.!?]+", text.strip()) if s.strip()]
      summary = ". ".join(sentences[:max_sentences])
      if summary and not summary.endswith("."):
        summary += "."
      return {"summary": summary, "max_sentences": max_sentences}
