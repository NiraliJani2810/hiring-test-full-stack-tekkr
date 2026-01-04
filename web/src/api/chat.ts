export async function completeChat(input: {
  messages: { role: "user" | "assistant"; content: string }[];
  model?: string;
}) {
  const res = await fetch("http://localhost:8000/api/chat/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? "Request failed");
  }

  return (await res.json()) as { content: string };
}
