import React, {
  ChangeEvent,
  EventHandler,
  KeyboardEventHandler,
  useRef,
  useState,
} from "react"
import { Button } from "./ui/button"
import { SendIcon } from "lucide-react"
import { Textarea } from "./ui/textarea"

interface Props {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInputBox({ onSend, disabled }: Props) {
  const [input, setInput] = useState("")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setInput("")

    // reset height after send
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "40px"
    }
  }

  function resizeTextArea(el: HTMLTextAreaElement) {
    el.style.height = "1px"
    el.style.height = el.scrollHeight + "px"
  }

  const onTextChange: EventHandler<ChangeEvent<HTMLTextAreaElement>> = (e) => {
    resizeTextArea(e.target)
    setInput(e.target.value)
  }

  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter") {
      const modifierPressed =
        e.shiftKey || e.ctrlKey || e.metaKey || e.altKey

      if (!modifierPressed) {
        e.preventDefault()
        handleSend()
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textAreaRef}
          className="h-10 max-h-36 min-h-10 resize-none pr-10"
          value={input}
          onChange={onTextChange}
          onKeyDown={onKeyDown}
          placeholder="Type your message..."
          disabled={disabled}
        />

        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
        >
          <SendIcon className="mr-2 h-5 w-5" />
          Send
        </Button>
      </div>
    </div>
  )
}
