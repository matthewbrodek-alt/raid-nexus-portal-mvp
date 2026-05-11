import { ChatWindow } from "@/components/chat/chat-window";
import { PageShell } from "@/components/layout/page-shell";

export default function ChatPage() {
  return (
    <PageShell
      eyebrow="Global Chat & Forum"
      title="Чат, треды и обсуждения"
      description="Telegram-like интерфейс: закреплённое сообщение, даты, аватарки, bubble-сообщения, вложения и нижняя строка ввода."
      compact
    >
      <ChatWindow />
    </PageShell>
  );
}
