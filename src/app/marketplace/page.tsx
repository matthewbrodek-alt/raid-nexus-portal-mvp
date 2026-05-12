import { MarketplaceBoard } from "@/components/market/marketplace-board";
import { PageShell } from "@/components/layout/page-shell";

export default function MarketplacePage() {
  return (
    <PageShell
      eyebrow={{ ru: "Маркет", en: "Marketplace" }}
      title={{ ru: "Магазин аккаунтов", en: "Account marketplace" }}
      description={{
        ru: "Темная витрина Raid: Shadow Legends с фильтрами, скриншотами, характеристиками аккаунтов и быстрым контактом с менеджером.",
        en: "A dark Raid: Shadow Legends storefront with filters, screenshots, account stats and quick manager contact."
      }}
    >
      <MarketplaceBoard />
    </PageShell>
  );
}
