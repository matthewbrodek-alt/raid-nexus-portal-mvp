import { clsx } from "clsx";

type GlassPanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function GlassPanel({ children, className }: GlassPanelProps) {
  return <div className={clsx("glass rounded-lg", className)}>{children}</div>;
}
