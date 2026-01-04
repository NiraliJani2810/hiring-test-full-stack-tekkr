export type UiMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

export type ChatSession = {
  id: string
  title: string
  model?: string
  messages: UiMessage[]
  createdAt: number
  updatedAt: number
}
