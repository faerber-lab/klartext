import axios from 'axios';

// ScaDS.AI LLM service — an OpenAI-compatible LiteLLM proxy.
// https://llm.scads.ai/docs/usage/api/
const DEFAULT_BASE_URL = 'https://llm.scads.ai/v1';
const DEFAULT_MODEL = 'google/gemma-4-31B-it';

export const CHAT_COMPLETIONS = '/chat/completions';

// Read lazily: dotenv.config() runs after these modules are imported,
// so anything resolved at module scope would miss backend/.env.
export const getBaseUrl = () => process.env.LLM_BASE_URL || DEFAULT_BASE_URL;

export const getModel = () => process.env.LLM_MODEL || DEFAULT_MODEL;

// The proxy reroutes to a fallback model when the primary is unavailable,
// which silently changes who answers. Opt out to keep every reply on getModel().
export const fallbacksDisabled = () => process.env.LLM_DISABLE_FALLBACKS === 'true';

// Keys are rate limited per minute, so the status code and the proxy's own
// message are worth keeping — axios alone would only report "status code 429".
export const describeApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.error?.message ?? error.response?.data?.error;
    const message = typeof detail === 'string' ? detail : error.message;
    return error.response ? `${error.response.status} ${message}` : message;
  }
  return error instanceof Error ? error.message : 'An unknown error occurred.';
};
