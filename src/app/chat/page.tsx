import { ChatWindow } from "@/components/chat/chat-window";
import { PageShell } from "@/components/layout/page-shell";

export default function ChatPage() {
  return (
    <PageShell
      eyebrow={{ ru: "Сообщения", en: "Messages" }}
      title={{ ru: "Чат и личные сообщения", en: "Chat and direct messages" }}
      description={{
        ru: "Общий чат портала и приватные диалоги 1 на 1 между участниками и администраторами.",
        en: "Global portal chat and private 1-on-1 dialogs between members and admins."
      }}
      compact
    >
      <ChatWindow />
    </PageShell>
  );
}
