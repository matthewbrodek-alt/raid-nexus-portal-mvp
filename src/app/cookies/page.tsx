import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";

export const metadata: Metadata = {
  title: "Cookie и локальное хранение | Bumpy Pay",
  description: "Правила использования cookie и локального хранения на Bumpy Pay."
};

export default function CookiesPage() {
  return <LegalDocumentPage kind="cookies" />;
}
