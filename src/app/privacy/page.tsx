import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";

export const metadata: Metadata = {
  title: "Политика конфиденциальности | Bumpy Pay",
  description: "Политика обработки персональных данных Bumpy Pay / Raid Portal."
};

export default function PrivacyPage() {
  return <LegalDocumentPage kind="privacy" />;
}
