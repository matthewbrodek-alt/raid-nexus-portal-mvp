import { DonatePageContent } from "@/components/donate/donate-page-content";
import { PageShell } from "@/components/layout/page-shell";

export default function TopupPage() {
  return (
    <PageShell
      eyebrow={{ ru: "Донат", en: "Donate" }}
      title={{ ru: "Донат Raid: Shadow Legends", en: "Raid: Shadow Legends top-up" }}
      description=""
      compact
    >
      <DonatePageContent />
    </PageShell>
  );
}
