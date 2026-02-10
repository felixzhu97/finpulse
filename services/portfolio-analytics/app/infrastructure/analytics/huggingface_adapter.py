from app.infrastructure.analytics.huggingface_client import summarise as hf_summarise_impl


class HfSummariseAdapter:
    def summarise(
        self,
        text: str,
        max_length: int = 150,
        min_length: int = 30,
    ) -> dict:
        return hf_summarise_impl(text=text, max_length=max_length, min_length=min_length)
