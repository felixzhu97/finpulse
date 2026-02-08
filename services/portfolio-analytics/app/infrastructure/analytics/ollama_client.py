from typing import Optional

import httpx

from app.config import OLLAMA_BASE_URL, OLLAMA_DEFAULT_MODEL


def generate(prompt: str, model: Optional[str] = None, stream: bool = False) -> dict:
  url = f"{OLLAMA_BASE_URL.rstrip('/')}/api/generate"
  payload = {
    "model": model or OLLAMA_DEFAULT_MODEL,
    "prompt": prompt,
    "stream": stream,
  }
  with httpx.Client(timeout=60.0) as client:
    resp = client.post(url, json=payload)
    resp.raise_for_status()
    data = resp.json()
  return {
    "response": data.get("response", ""),
    "model": data.get("model", model or OLLAMA_DEFAULT_MODEL),
    "done": data.get("done", True),
  }
