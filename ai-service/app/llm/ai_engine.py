import logging
from langchain_openai import ChatOpenAI
from app.config import settings

logger = logging.getLogger("fashionhub.ai_engine")


# List of free models to try in order when primary hits rate limit
FREE_MODEL_FALLBACKS = [
    settings.MODEL_NAME,  # Primary from .env
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "nvidia/nemotron-nano-9b-v2:free",
    "openai/gpt-oss-20b:free",
    "poolside/laguna-xs-2.1:free",
    "poolside/laguna-s-2.1:free",
]

# Remove duplicates while preserving order
seen = set()
FALLBACK_MODELS = []
for m in FREE_MODEL_FALLBACKS:
    if m and m not in seen:
        seen.add(m)
        FALLBACK_MODELS.append(m)


def _make_llm(model_name: str) -> ChatOpenAI:
    return ChatOpenAI(
        model=model_name,
        api_key=settings.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
        temperature=0.3,
        max_tokens=1500,
    )


class FallbackLLM:
    """
    A drop-in LLM wrapper that tries multiple models in order.
    If a model returns a 429 (rate limit), it automatically
    falls back to the next model in the list.
    """

    def __init__(self):
        self._models = FALLBACK_MODELS
        logger.info("FallbackLLM initialized with %d models: %s", len(self._models), self._models)

    async def ainvoke(self, messages):
        last_error = None
        for i, model_name in enumerate(self._models):
            try:
                llm = _make_llm(model_name)
                result = await llm.ainvoke(messages)
                if i > 0:
                    logger.info("FallbackLLM: succeeded with fallback model[%d] = %s", i, model_name)
                return result
            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "rate limit" in err_str.lower() or "Rate limit" in err_str:
                    logger.warning(
                        "FallbackLLM: model[%d] %s hit rate limit, trying next...",
                        i, model_name
                    )
                    last_error = e
                    continue
                else:
                    # Non-rate-limit error — re-raise immediately
                    logger.error("FallbackLLM: model %s non-rate-limit error: %s", model_name, err_str[:200])
                    raise

        # All models exhausted
        logger.error("FallbackLLM: all %d models exhausted. Last error: %s", len(self._models), str(last_error)[:200])
        raise last_error


class AIEngine:

    def __init__(self):
        self.llm = FallbackLLM()
        logger.info("AIEngine ready with FallbackLLM (primary=%s)", FALLBACK_MODELS[0] if FALLBACK_MODELS else "none")

    def get_llm(self):
        return self.llm