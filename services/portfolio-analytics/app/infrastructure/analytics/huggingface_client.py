from app.config import HF_SUMMARISATION_MODEL

_pipeline = None


def _get_pipeline():
  global _pipeline
  if _pipeline is None:
    from transformers import pipeline
    _pipeline = pipeline("summarization", model=HF_SUMMARISATION_MODEL)
  return _pipeline


def summarise(text: str, max_length: int = 150, min_length: int = 30) -> dict:
  try:
    pipe = _get_pipeline()
  except Exception as e:
    return {"summary": "", "model": HF_SUMMARISATION_MODEL, "error": str(e)}
  truncated = text[:4096] if text else ""
  out = pipe(truncated, max_length=max_length, min_length=min_length, do_sample=False)
  summary = (out[0].get("summary_text") or "").strip() if out else ""
  return {"summary": summary, "model": HF_SUMMARISATION_MODEL}
