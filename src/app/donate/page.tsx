import { DonatePageContent } from "@/components/donate/donate-page-content";
import { PageShell } from "@/components/layout/page-shell";

export default function DonatePage() {
  return (
    <PageShell eyebrow="Донат" title="Донат Raid: Shadow Legends" description="" compact>
      <DonatePageContent />
    </PageShell>
  );
}
