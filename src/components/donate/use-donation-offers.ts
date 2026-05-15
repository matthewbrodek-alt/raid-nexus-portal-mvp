"use client";

import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import {
  fallbackDonationOffers,
  normalizeDonationOffer,
  type DonationOffer
} from "@/lib/donation/offers";

export function useDonationOffers() {
  const [offers, setOffers] = useState<DonationOffer[]>(fallbackDonationOffers);

  useEffect(() => {
    const offersQuery = query(
      collection(db, collections.donationOffers),
      where("status", "==", "published"),
      limit(40)
    );

    return onSnapshot(
      offersQuery,
      (snapshot) => {
        const items = snapshot.docs
          .map((item) => normalizeDonationOffer(item.id, item.data()))
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));

        setOffers(items.length > 0 ? items : fallbackDonationOffers);
      },
      () => {
        setOffers(fallbackDonationOffers);
      }
    );
  }, []);

  return offers;
}
