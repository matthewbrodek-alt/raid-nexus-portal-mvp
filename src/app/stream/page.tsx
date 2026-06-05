import { PageShell } from "@/components/layout/page-shell";
import { StreamPageContent } from "@/components/stream/stream-page-content";

export default function StreamPage() {
  return (
    <PageShell
      eyebrow={{ ru: "Эфир", en: "Live" }}
      title={{ ru: "Эфир", en: "Live stream" }}
      description=""
      compact
    >
      <StreamPageContent />
    </PageShell>
  );
}
