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
        eyebrow={{ ru: "Связь по заказу", en: "Order support" }}
        title={{ ru: "Заявка и менеджер", en: "Request and manager" }}
        description={{
          ru: "Переписка, сумма, статус и Bumpy Coins по конкретному игровому заказу.",
          en: "Messages, amount, status and Bumpy Coins for a specific game order."
        }}
      >
        <OrderRequestView leadId={leadId} />
      </PageShell>
    </ProtectedRoute>
  );
}
