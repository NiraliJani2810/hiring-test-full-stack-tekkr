import { ChatSession } from "./types";

const CHATS_KEY = "tekkr.chats.v1";
const SELECTED_KEY = "tekkr.selectedChatId.v1";

export function loadChats(): ChatSession[] {
  try {
    const raw = localStorage.getItem(CHATS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveChats(chats: ChatSession[]) {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

export function loadSelectedChatId(): string | null {
  return localStorage.getItem(SELECTED_KEY);
}

export function saveSelectedChatId(id: string) {
  localStorage.setItem(SELECTED_KEY, id);
}
