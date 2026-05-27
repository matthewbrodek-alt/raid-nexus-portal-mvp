import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [];
}

export default function HeroDetailPage() {
  redirect("/heroes");
}
