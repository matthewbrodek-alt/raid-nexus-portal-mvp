import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

export type TopupLeadInput = {
  uid?: string;
  telegram: string;
  packageId: string;
  comment?: string;
};

export async function createTopupLead(input: TopupLeadInput) {
  const docRef = await addDoc(collection(db, collections.topupLeads), {
    ...input,
    status: "new",
    source: "portal",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  await fetch("/api/n8n/topup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leadId: docRef.id, ...input })
  }).catch(() => undefined);

  return docRef.id;
}
