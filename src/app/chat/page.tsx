import { ChatWindow } from "@/components/chat/chat-window";
import { PageShell } from "@/components/layout/page-shell";

export default function ChatPage() {
  return (
    <PageShell
      eyebrow="Messages"
      title="Чат и личные сообщения"
      description="Общий чат портала и приватные диалоги 1 на 1 между участниками и администраторами."
      compact
    >
      <ChatWindow />
    </PageShell>
  );
}
