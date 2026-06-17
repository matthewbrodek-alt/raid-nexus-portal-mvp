import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";

export const metadata: Metadata = {
  title: "Пользовательское соглашение | Bumpy Pay",
  description: "Правила использования портала Bumpy Pay / Raid Portal."
};

export default function TermsPage() {
  return <LegalDocumentPage kind="terms" />;
}
