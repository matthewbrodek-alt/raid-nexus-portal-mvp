import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Images, ScrollText, Shield } from "lucide-react";
import { HeroYoutube } from "@/components/heroes/hero-youtube";
import { PageShell } from "@/components/layout/page-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import { featuredHeroes } from "@/lib/data/mock";

type HeroDetailPageProps = {
  params: Promise<{
    heroId: string;
  }>;
};

export function generateStaticParams() {
  return featuredHeroes.map((hero) => ({
    heroId: hero.slug ?? hero.id
  }));
}

export default async function HeroDetailPage({ params }: HeroDetailPageProps) {
  const { heroId } = await params;
  const hero = featuredHeroes.find((item) => (item.slug ?? item.id) === heroId);

  if (!hero) {
    notFound();
  }

  return (
    <PageShell
      eyebrow="Hero DB"
      title={hero.name}
      description={`${hero.faction} / ${hero.rarity} / ${hero.role}. Подробная страница героя с комментарием, галереей и YouTube-гайдом под hero-блоком.`}
    >
      <Link href="/heroes" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-relic">
        <ArrowLeft size={16} />
        Назад к базе героев
      </Link>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassPanel className="overflow-hidden">
          <div className="aspect-[16/11] bg-gradient-to-br from-charcoal via-black to-blood/40 p-6">
            <div className="flex h-full items-end justify-between">
              <div>
                <p className="text-sm text-relic">{hero.faction}</p>
                <h2 className="text-4xl font-black text-white">{hero.name}</h2>
              </div>
              <span className="rounded-md border border-relic/30 bg-black/30 px-3 py-2 text-sm text-relic">
                {hero.rarity}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 p-5">
            {["Arena", "Clan Boss", "Hydra"].map((label) => (
              <div key={label} className="rounded-lg border border-white/10 bg-black/25 p-3 text-center">
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="mt-1 font-bold text-relic">{hero.rating}/5</p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <div className="grid gap-4">
          <GlassPanel className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <ScrollText className="text-relic" />
              <h2 className="text-2xl font-bold text-white">Комментарий</h2>
            </div>
            <p className="text-sm leading-7 text-zinc-300">{hero.comment}</p>
          </GlassPanel>
          <GlassPanel className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <Images className="text-relic" />
              <h2 className="text-2xl font-bold text-white">Галерея</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((slot) => (
                <div key={slot} className="aspect-video rounded-lg border border-white/10 bg-white/[0.04]" />
              ))}
            </div>
          </GlassPanel>
          <GlassPanel className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <Shield className="text-relic" />
              <h2 className="text-2xl font-bold text-white">Использование</h2>
            </div>
            <p className="text-sm leading-7 text-zinc-400">
              Блок готов для данных из Firestore: билды, мастерки, артефакты, blessings, team comps и заметки админа.
            </p>
          </GlassPanel>
        </div>
      </div>

      <div className="mt-6">
        <HeroYoutube videoId={hero.youtubeVideoId} title={hero.youtubeTitle} />
      </div>
    </PageShell>
  );
}
