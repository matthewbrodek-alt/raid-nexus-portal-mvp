import { ClanBoard } from "@/components/clans/clan-board";
import { PageShell } from "@/components/layout/page-shell";

export default function ClansPage() {
  return (
    <PageShell
      eyebrow={{ ru: "Кланы", en: "Clans" }}
      title={{ ru: "Доска кланов", en: "Clan Board" }}
      description={{
        ru: "Раздел для объявлений участников: набор в клан, требования, расписание активности и контакты.",
        en: "A board for member announcements: clan recruiting, requirements, activity schedule and contacts."
      }}
    >
      <ClanBoard />
    </PageShell>
  );
}
