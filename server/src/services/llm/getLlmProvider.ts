import { LlmProvider } from "./types";
import { OpenAiProvider } from "./providers/openai";

export function getLlmProvider(): LlmProvider {
  // Swap this to AnthropicProvider or GeminiProvider later with minimal changes.
  return new OpenAiProvider({
    apiKey: process.env.OPENAI_API_KEY ?? "",
  });
}
