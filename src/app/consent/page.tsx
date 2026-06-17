import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных | Bumpy Pay",
  description: "Согласие пользователя на обработку персональных данных."
};

export default function ConsentPage() {
  return <LegalDocumentPage kind="consent" />;
}
