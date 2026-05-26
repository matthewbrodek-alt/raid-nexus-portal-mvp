import { ProtectedRoute } from "@/components/auth/protected-route";
import { PageShell } from "@/components/layout/page-shell";
import { OrderRequestView } from "@/components/orders/order-request-view";

type OrderPageProps = {
  params: Promise<{
    leadId: string;
  }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { leadId } = await params;

  return (
    <ProtectedRoute>
      <PageShell
        eyebrow={{ ru: "Заказ RAID", en: "RAID order" }}
        title={{ ru: "Страница заявки", en: "Request page" }}
        description={{
          ru: "Этапы выполнения, сумма, реквизиты и переписка с менеджером по конкретному игровому набору.",
          en: "Stages, amount, payment details and manager communication for a specific game pack."
        }}
      >
        <OrderRequestView leadId={leadId} />
      </PageShell>
    </ProtectedRoute>
  );
}
