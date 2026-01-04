import { splitMessageParts } from "../lib/projectPlan";
import { ProjectPlanPreview } from "./ProjectPlanPreview";

export function ChatMessage({ role, content }: { role: string; content: string }) {
  const parts = splitMessageParts(content);

  return (
    <div className={`max-w-2xl whitespace-pre-wrap rounded-lg px-4 py-3 text-sm ${
      role === "user" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted"
    }`}>
      {parts.map((p, idx) => {
        if (p.type === "text") return <span key={idx}>{p.value}</span>;
        return <ProjectPlanPreview key={idx} plan={p.value} />;
      })}
    </div>
  );
}
