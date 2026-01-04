import { ChatMessage as Bubble } from "./ChatMessage";

export function ChatTranscript({
  messages,
  loading,
}: {
  messages: { id: string; role: "user" | "assistant"; content: string }[];
  loading: boolean;
}) {
  return (
    <div className="space-y-3">
      {messages.map(m => (
        <Bubble key={m.id} role={m.role} content={m.content} />
      ))}

      {loading ? (
        <div className="mr-auto max-w-2xl rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Thinking…
        </div>
      ) : null}
    </div>
  );
}
