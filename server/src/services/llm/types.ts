export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface LlmProvider {
  generate(input: { messages: ChatMessage[]; model?: string }): Promise<string>;
}
