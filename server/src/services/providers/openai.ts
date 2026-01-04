import { LlmProvider, ChatMessage } from "../types";
import OpenAI from "openai";

type Ctor = { apiKey: string };

export class OpenAiProvider implements LlmProvider {
  private client: OpenAI;

  constructor({ apiKey }: Ctor) {
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
    this.client = new OpenAI({ apiKey });
  }

  async generate(input: { messages: ChatMessage[]; model?: string }): Promise<string> {
    const model = input.model ?? "gpt-4o-mini";

    // System prompt strongly nudges the format for project plans:
    const system = {
      role: "system" as const,
      content:
        "You are a helpful assistant. If the user asks for a project plan, embed it inline as <project_plan>{JSON}</project_plan>. " +
        "The JSON must be valid and follow: { workstreams: [{ id, title, description, deliverables: [{ title, description }] }] }. " +
        "The <project_plan> block may appear in the middle of a normal paragraph.",
    };

    const res = await this.client.chat.completions.create({
      model,
      messages: [system, ...input.messages],
      temperature: 0.4,
    });

    return res.choices[0]?.message?.content ?? "";
  }
}
