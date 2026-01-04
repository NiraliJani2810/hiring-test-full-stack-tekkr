import { useEffect, useMemo, useState } from "react"
import { nanoid } from "nanoid"
import { useMutation } from "@tanstack/react-query"

import { ChatSidebar } from "../components/chat-sidebar"
import { ChatInputBox } from "../components/chat-input-box"
import { MessageContainer } from "../components/message"

import { completeChat } from "../api/chat"
import { ChatSession, UiMessage } from "../lib/types/chat"
import {
  loadChats,
  saveChats,
  loadSelectedChatId,
  saveSelectedChatId,
} from "../lib/chatStore"

function createNewChat(): ChatSession {
  const now = Date.now()
  return {
    id: nanoid(),
    title: "New Chat",
    model: "gpt-4o-mini",
    messages: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function HomePage() {
  /* -------------------- STATE -------------------- */

  const [chats, setChats] = useState<ChatSession[]>(() => {
    const stored = loadChats()
    return stored.length > 0 ? stored : [createNewChat()]
  })

  const [selectedChatId, setSelectedChatId] = useState<string | null>(() => {
    const storedId = loadSelectedChatId()
    const storedChats = loadChats()
    if (storedId && storedChats.some(c => c.id === storedId)) {
      return storedId
    }
    return storedChats[0]?.id ?? null
  })

  /* -------------------- PERSISTENCE -------------------- */

  useEffect(() => {
    saveChats(chats)
  }, [chats])

  useEffect(() => {
    if (selectedChatId) saveSelectedChatId(selectedChatId)
  }, [selectedChatId])

  /* -------------------- DERIVED -------------------- */

  const selectedChat = useMemo(
    () => chats.find(c => c.id === selectedChatId) ?? null,
    [chats, selectedChatId]
  )

  /* -------------------- API -------------------- */

  const mutation = useMutation({
    mutationFn: completeChat,
  })

  /* -------------------- ACTIONS -------------------- */

  const handleCreateChat = () => {
    const newChat = createNewChat()
    setChats(prev => [newChat, ...prev])
    setSelectedChatId(newChat.id)
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !selectedChat || mutation.isPending) return

    const userMessage: UiMessage = {
      id: nanoid(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    }

    // optimistic update
    setChats(prev =>
      prev.map(chat =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              updatedAt: Date.now(),
            }
          : chat
      )
    )

    try {
      const apiMessages = [...selectedChat.messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await mutation.mutateAsync({
        messages: apiMessages,
        model: selectedChat.model,
      })

      const assistantMessage: UiMessage = {
        id: nanoid(),
        role: "assistant",
        content: response.content,
        createdAt: Date.now(),
      }

      setChats(prev =>
        prev.map(chat =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                messages: [...chat.messages, assistantMessage],
                updatedAt: Date.now(),
              }
            : chat
        )
      )
    } catch {
      const errorMessage: UiMessage = {
        id: nanoid(),
        role: "assistant",
        content: "Sorry, something went wrong while generating a response.",
        createdAt: Date.now(),
      }

      setChats(prev =>
        prev.map(chat =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                messages: [...chat.messages, errorMessage],
                updatedAt: Date.now(),
              }
            : chat
        )
      )
    }
  }

  /* -------------------- RENDER -------------------- */

  return (
    <div className="flex">
      <ChatSidebar
        chats={chats.map(chat => ({
          id: chat.id,
          name: chat.title,
        }))}
        selectedChatId={selectedChatId}
        onCreateChat={handleCreateChat}
        onSelectChat={setSelectedChatId}
      />

      <div className="flex flex-col pt-8 max-w-4xl ms-64 w-full gap-4">
        {selectedChat ? (
          <>
            <h2 className="text-lg font-semibold">
              {selectedChat.title}
            </h2>

            <div className="flex flex-col gap-4">
              {selectedChat.messages.map(message => (
                <MessageContainer key={message.id} role={message.role}>
                  {message.content}
                </MessageContainer>
              ))}

              {mutation.isPending && (
                <MessageContainer role="assistant">
                  Thinking…
                </MessageContainer>
              )}
            </div>

            <ChatInputBox onSend={handleSendMessage} />
          </>
        ) : (
          <div className="text-muted-foreground">
            Select or create a chat to begin.
          </div>
        )}
      </div>
    </div>
  )
}
