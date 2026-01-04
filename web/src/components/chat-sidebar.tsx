import { Button } from "./ui/button"
import { MessagesSquareIcon, PlusIcon } from "lucide-react"

interface ChatReference {
  id: string
  name: string
}

interface Props {
  chats: ChatReference[]
  selectedChatId: string | null
  onCreateChat: () => void
  onSelectChat: (chatId: string) => void
}

export function ChatSidebar({
  chats,
  selectedChatId,
  onCreateChat,
  onSelectChat,
}: Props) {
  return (
    <div className="fixed left-0 top-16 bottom-0 w-64 border-r-2 border-r-accent p-4 flex flex-col gap-3">
      <Button onClick={onCreateChat} size="sm">
        <PlusIcon className="w-5 h-5 mr-2" />
        New Chat
      </Button>

      <hr />

      <div className="flex flex-col gap-1 overflow-y-auto">
        {chats.map(chat => (
          <Button
            key={chat.id}
            variant={selectedChatId === chat.id ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start text-left"
            onClick={() => onSelectChat(chat.id)}
          >
            <MessagesSquareIcon className="w-5 h-5 mr-2" />
            {chat.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
