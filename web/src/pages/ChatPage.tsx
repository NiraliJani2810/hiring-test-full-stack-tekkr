import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { completeChat } from "../api/chat";
import { loadChats, loadSelectedChatId, saveChats, saveSelectedChatId } from "../lib/chatStore";
import { ChatSession, UiMessage } from "../lib/types";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// plus your layout components

function newChatSession(): ChatSession {
  const id = nanoid();
  const now = Date.now();
  return {
    id,
    title: `Chat ${id.slice(0, 4)}`,
    model: "gpt-4o-mini",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function ChatPage() {
  const [chats, setChats] = useState<ChatSession[]>(() => {
    const existing = loadChats();
    return existing.length ? existing : [newChatSession()];
  });

  const [selectedChatId, setSelectedChatId] = useState<string>(() => {
    const stored = loadSelectedChatId();
    const existing = loadChats();
    if (stored && existing.some(c => c.id === stored)) return stored;
    return (existing[0]?.id ?? chats[0].id);
  });

  // keep localStorage in sync
  useEffect(() => saveChats(chats), [chats]);
  useEffect(() => saveSelectedChatId(selectedChatId), [selectedChatId]);

  const selectedChat = useMemo(
    () => chats.find(c => c.id === selectedChatId) ?? chats[0],
    [chats, selectedChatId]
  );

  const [draft, setDraft] = useState("");

  const mutation = useMutation({
    mutationFn: completeChat,
  });

  const onNewChat = () => {
    const created = newChatSession();
    setChats(prev => [created, ...prev]);
    setSelectedChatId(created.id);
    setDraft("");
  };

  const onSelectChat = (id: string) => setSelectedChatId(id);

  const onSend = async () => {
    const text = draft.trim();
    if (!text || mutation.isPending) return;

    const userMsg: UiMessage = {
      id: nanoid(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    // optimistic update
    setChats(prev =>
      prev.map(c =>
        c.id === selectedChat.id
          ? { ...c, messages: [...c.messages, userMsg], updatedAt: Date.now() }
          : c
      )
    );
    setDraft("");

    try {
      const history = [...selectedChat.messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await mutation.mutateAsync({
        messages: history,
        model: selectedChat.model,
      });

      const assistantMsg: UiMessage = {
        id: nanoid(),
        role: "assistant",
        content: res.content,
        createdAt: Date.now(),
      };

      setChats(prev =>
        prev.map(c =>
          c.id === selectedChat.id
            ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() }
            : c
        )
      );
    } catch (e: any) {
      // graceful error handling: show an assistant error bubble (looks professional)
      const assistantMsg: UiMessage = {
        id: nanoid(),
        role: "assistant",
        content: `Sorry — I ran into an error while generating a response.\n\n${e?.message ?? ""}`.trim(),
        createdAt: Date.now(),
      };
      setChats(prev =>
        prev.map(c =>
          c.id === selectedChat.id
            ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() }
            : c
        )
      );
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-72 border-r p-3">
        <Button className="w-full" onClick={onNewChat}>New Chat</Button>

        <div className="mt-3 space-y-1">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full rounded px-3 py-2 text-left text-sm ${
                chat.id === selectedChatId ? "bg-muted" : "hover:bg-muted/60"
              }`}
            >
              <div className="font-medium">{chat.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {chat.messages.at(-1)?.content ?? "No messages yet"}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main chat */}
      <main className="flex flex-1 flex-col">
        <div className="flex-1 overflow-auto p-4">
          <ChatTranscript
            messages={selectedChat.messages}
            loading={mutation.isPending}
          />
        </div>

        <div className="border-t p-3 flex gap-2">
          <Input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <Button onClick={onSend} disabled={mutation.isPending || !draft.trim()}>
            Send
          </Button>
        </div>
      </main>
    </div>
  );
}
