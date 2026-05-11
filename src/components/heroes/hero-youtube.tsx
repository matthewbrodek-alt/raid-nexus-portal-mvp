import { Youtube } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";

type HeroYoutubeProps = {
  videoId?: string;
  title?: string;
};

export function HeroYoutube({ videoId, title = "Hero guide video" }: HeroYoutubeProps) {
  if (!videoId) {
    return (
      <GlassPanel className="p-6">
        <div className="mb-3 flex items-center gap-3">
          <Youtube className="text-ember" />
          <h2 className="text-2xl font-bold text-white">YouTube guide</h2>
        </div>
        <p className="text-sm text-zinc-400">Видео для этого героя еще не добавлено в админ-панели.</p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-white/10 p-5">
        <Youtube className="text-ember" />
        <div>
          <h2 className="text-2xl font-bold text-white">YouTube guide</h2>
          <p className="text-sm text-zinc-400">{title}</p>
        </div>
      </div>
      <div className="aspect-video bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </GlassPanel>
  );
}
