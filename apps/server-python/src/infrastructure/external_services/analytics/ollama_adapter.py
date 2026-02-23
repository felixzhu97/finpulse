from typing import Optional

from src.infrastructure.external_services.analytics.ollama_client import generate as ollama_generate_impl


class OllamaGenerateAdapter:
    def generate(self, prompt: str, model: Optional[str] = None) -> dict:
        return ollama_generate_impl(prompt=prompt, model=model)
