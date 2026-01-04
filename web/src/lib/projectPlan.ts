import { z } from "zod";

export const ProjectPlanSchema = z.object({
  workstreams: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional().default(""),
      deliverables: z.array(
        z.object({
          title: z.string(),
          description: z.string().optional().default(""),
        })
      ).default([]),
    })
  ),
});

export type ProjectPlan = z.infer<typeof ProjectPlanSchema>;

export type MessagePart =
  | { type: "text"; value: string }
  | { type: "project_plan"; value: ProjectPlan; raw: string };

export function splitMessageParts(content: string): MessagePart[] {
  const parts: MessagePart[] = [];
  const re = /<project_plan>([\s\S]*?)<\/project_plan>/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(content)) !== null) {
    const start = match.index;
    const end = re.lastIndex;

    if (start > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, start) });
    }

    const rawJson = match[1]?.trim() ?? "";
    try {
      const parsedJson = JSON.parse(rawJson);
      const plan = ProjectPlanSchema.parse(parsedJson);
      parts.push({ type: "project_plan", value: plan, raw: rawJson });
    } catch {
      // if parsing fails, just render it as text so UI never breaks
      parts.push({ type: "text", value: `<project_plan>${rawJson}</project_plan>` });
    }

    lastIndex = end;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  return parts.filter(p => !(p.type === "text" && p.value.trim() === ""));
}
