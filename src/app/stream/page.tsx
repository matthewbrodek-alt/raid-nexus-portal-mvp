import { PageShell } from "@/components/layout/page-shell";
import { StreamPageContent } from "@/components/stream/stream-page-content";

export default function StreamPage() {
  return (
    <PageShell
      eyebrow={{ ru: "Эфир", en: "Live" }}
      title={{ ru: "Эфир", en: "Live stream" }}
      description={{
        ru: "Актуальная трансляция портала с индикатором статуса: зеленый свет означает, что эфир запущен, красный — трансляция выключена.",
        en: "Current portal stream with a live status indicator: green means live, red means offline."
      }}
    >
      <StreamPageContent />
    </PageShell>
  );
}
