import { MarketplaceBoard } from "@/components/market/marketplace-board";
import { PageShell } from "@/components/layout/page-shell";

export default function MarketplacePage() {
  return (
    <PageShell
      eyebrow={{ ru: "Покупка аккаунта", en: "Account Purchase" }}
      title={{ ru: "Покупка аккаунта", en: "Account Purchase" }}
      description={{
        ru: "Темная витрина Raid: Shadow Legends с фильтрами, скриншотами, характеристиками аккаунтов и быстрым контактом с менеджером.",
        en: "A dark Raid: Shadow Legends storefront with filters, screenshots, account stats and quick manager contact."
      }}
    >
      <MarketplaceBoard />
    </PageShell>
  );
}
