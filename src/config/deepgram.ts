import type { LiveSchema } from "@deepgram/sdk";

export const DEFAULT_DEEPGRAM_OPTIONS: LiveSchema = {
  model: "nova-3",
  interim_results: true,
  smart_format: true,
  filler_words: true,
  utterance_end_ms: 3000,
};
